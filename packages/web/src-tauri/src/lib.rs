use tauri::{command, Manager};
use std::sync::Mutex;
use std::process::Child;

struct ApiServerState {
    port: u16,
    process: Option<Child>,
}

#[command]
fn get_api_url(state: tauri::State<Mutex<ApiServerState>>) -> String {
    let server = state.lock().unwrap();
    format!("http://localhost:{}", server.port)
}

// Get API port from environment or use default
fn get_api_port() -> u16 {
    std::env::var("API_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Initialize API server state with configurable port
      let api_state = ApiServerState {
        port: get_api_port(),
        process: None,
      };
      app.manage(Mutex::new(api_state));
      
      // Note: The API server is expected to run as a separate process.
      // In development: Start manually with `npm start` in packages/api
      // In production: Can be bundled as a sidecar or started via system service
      // This design keeps the Tauri app lightweight and allows for flexible deployment.
      
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![get_api_url])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
