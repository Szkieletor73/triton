use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: i64,

    pub name: String,

    pub category: i64
}