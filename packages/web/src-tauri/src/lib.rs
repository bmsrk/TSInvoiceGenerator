use tauri::{command, AppHandle, Manager};
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
      
      // Initialize API server state
      let api_state = ApiServerState {
        port: 3001,
        process: None,
      };
      app.manage(Mutex::new(api_state));
      
      // Note: In development, the API server should be started separately
      // In production, we would start it here as a child process
      
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![get_api_url])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
