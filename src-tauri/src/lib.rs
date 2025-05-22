mod commands;
mod database;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let db_path = app
                .path()
                .app_data_dir()
                .expect("Failed to get App Data Dir")
                .join("database.db");

            let pool = tokio::runtime::Runtime::new()
                .unwrap()
                .block_on(database::init_db(db_path.to_str().unwrap()))?;

            app.manage(pool);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                commands::raw_sql,
                commands::add_items,
                commands::get_items,
                commands::get_item_details
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
