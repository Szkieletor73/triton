use std::{path::PathBuf, time};
use chrono::{DateTime, Utc};
use ffmpeg_sidecar::command::FfmpegCommand;

use crate::APP_DATA_DIR;

pub async fn generate_thumb(vid_path: &PathBuf) -> anyhow::Result<String> {
    let timestamp: DateTime<Utc> = time::SystemTime::now().into();

    let output_name = vid_path.clone().file_stem()
        .expect("Input filename is invalid, couldn't extract stem.")
        .to_str()
        .unwrap()
        .to_owned() + &timestamp.timestamp_millis().to_string() + ".webp";
    
    let output_path = APP_DATA_DIR.get()
        .expect("Failed to get APP_DATA_DIR global, is it set?")
        .join("thumbs\\".to_owned() + &output_name);

    if let Some(parent) = output_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    let iter = FfmpegCommand::new()
        .input(vid_path.to_str().unwrap())
        .filter(r"select=eq(n\,1)".to_string())
        .frames(1)
        .output(output_path.to_str().unwrap())
        .spawn()?
        .iter()?;
        
    for err in iter.filter_errors() {
        println!(
            "error: {}", err
        )
    }

    Ok(output_path.to_string_lossy().into_owned())
}