use tauri::{command, Manager};
use std::process::Command as StdCommand;
use std::sync::Mutex;

struct ApiServerState {
    port: u16,
    running: bool,
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
        running: false,
      };
      app.manage(Mutex::new(api_state));
      
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![get_api_url])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
