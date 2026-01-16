# Easy-Stream API 文档 v2.0

## 目录

- [基本信息](#基本信息)
- [认证机制](#认证机制)
- [认证接口](#1-认证接口)
- [推流管理接口](#2-推流管理接口)
- [分享链接接口](#3-分享链接接口)
- [系统接口](#4-系统接口)
- [ZLMediaKit Hook 接口](#5-zlmediakit-hook-接口)
- [数据模型](#数据模型)
- [错误码](#错误码)

---

## 基本信息

| 项目 | 说明 |
|------|------|
| Base URL | `http://localhost:8080/api/v1` |
| 认证方式 | JWT Bearer Token (Access Token + Refresh Token) |
| Content-Type | `application/json` |
| 字符编码 | UTF-8 |

---

## 认证机制

### Token 说明

本系统采用双 Token 机制：

| Token 类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 2 小时 | 访问 API 接口 |
| Refresh Token | 7 天 | 刷新 Access Token |

### 认证流程

```
1. 用户登录 → 获取 access_token + refresh_token
2. 使用 access_token 访问 API
3. access_token 过期前，使用 refresh_token 获取新的 token 对
4. refresh_token 过期后，需要重新登录
```

### 请求头格式

```
Authorization: Bearer {access_token}
```

---

## 1. 认证接口

### 1.1 用户登录

**接口地址**
```
POST /api/v1/auth/login
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例** (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "1_a1b2c3d4e5f6...",
  "expires_in": 7200,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "13800138000",
    "real_name": "系统管理员",
    "avatar": "",
    "last_login_at": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

**错误响应** (401 Unauthorized)
```json
{
  "error": "invalid credentials"
}
```

---

### 1.2 刷新令牌

**接口地址**
```
POST /api/v1/auth/refresh
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refresh_token | string | 是 | 刷新令牌 |

**请求示例**
```json
{
  "refresh_token": "1_a1b2c3d4e5f6..."
}
```

**响应示例** (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "1_new_token...",
  "expires_in": 7200
}
```

**错误响应** (401 Unauthorized)
```json
{
  "error": "invalid or expired refresh token"
}
```

---

### 1.3 用户登出

**接口地址**
```
POST /api/v1/auth/logout
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| refresh_token | string | 否 | 刷新令牌（用于撤销） |

**请求示例**
```json
{
  "refresh_token": "1_a1b2c3d4e5f6..."
}
```

**响应示例** (200 OK)
```json
{
  "message": "logged out"
}
```

---

### 1.4 获取当前用户信息

**接口地址**
```
GET /api/v1/auth/profile
```

**请求头**
```
Authorization: Bearer {access_token}
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "phone": "13800138000",
  "real_name": "系统管理员",
  "avatar": "",
  "last_login_at": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

## 2. 推流管理接口

### 2.1 获取推流列表

> 游客可访问，但只能看到公开且正在直播的内容；管理员可看到所有直播记录（包括过去、正在进行和将来的）

**接口地址**
```
GET /api/v1/streams
```

**查询参数**

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| status | string | 否 | - | 状态过滤：`idle`/`pushing`/`ended`（仅管理员有效） |
| visibility | string | 否 | - | 可见性过滤：`public`/`private`（仅管理员有效） |
| time_range | string | 否 | - | 时间范围：`past`/`current`/`future`（仅管理员有效） |
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页数量 |

**时间范围说明**

| 值 | 说明 |
|----|------|
| past | 已结束的直播（actual_end_time 不为空） |
| current | 正在进行的直播（status = pushing） |
| future | 未开始的直播（status = idle 且 scheduled_start_time > 当前时间） |

**请求示例**
```
GET /api/v1/streams?status=pushing&page=1&pageSize=20
GET /api/v1/streams?time_range=past&page=1&pageSize=20
```

**响应示例** (200 OK)
```json
{
  "total": 100,
  "streams": [
    {
      "id": 1,
      "stream_key": "abc123def456",
      "name": "技术分享会",
      "description": "每周技术分享直播",
      "device_id": "camera-001",
      "status": "pushing",
      "visibility": "public",
      "record_enabled": true,
      "record_files": ["/recordings/2024/01/01/abc123def456_001.mp4"],
      "protocol": "rtmp",
      "bitrate": 2500,
      "fps": 30,
      "streamer_name": "张三",
      "streamer_contact": "13800138000",
      "scheduled_start_time": "2024-01-01T14:00:00Z",
      "scheduled_end_time": "2024-01-01T16:00:00Z",
      "auto_kick_delay": 30,
      "actual_start_time": "2024-01-01T14:05:00Z",
      "actual_end_time": null,
      "last_frame_at": "2024-01-01T15:30:00Z",
      "current_viewers": 128,
      "total_viewers": 1520,
      "peak_viewers": 256,
      "created_by": 1,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T14:05:00Z"
    }
  ]
}
```

---

### 2.2 创建推流码（管理员）

**接口地址**
```
POST /api/v1/streams
```

**请求头**
```
Authorization: Bearer {access_token}
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 直播名称 |
| description | string | 否 | 直播描述 |
| device_id | string | 否 | 设备 ID |
| visibility | string | 是 | 可见性：`public`/`private` |
| record_enabled | bool | 否 | 是否开启录制，默认 false |
| streamer_name | string | 是 | 直播人员姓名 |
| streamer_contact | string | 否 | 直播人员联系方式 |
| scheduled_start_time | datetime | 是 | 预计开始时间 (ISO 8601) |
| scheduled_end_time | datetime | 是 | 预计结束时间 (ISO 8601) |
| auto_kick_delay | int | 否 | 超时断流延迟（分钟），默认 30 |

**请求示例**
```json
{
  "name": "技术分享会",
  "description": "每周技术分享直播",
  "device_id": "camera-001",
  "visibility": "public",
  "record_enabled": true,
  "streamer_name": "张三",
  "streamer_contact": "13800138000",
  "scheduled_start_time": "2024-01-01T14:00:00Z",
  "scheduled_end_time": "2024-01-01T16:00:00Z",
  "auto_kick_delay": 30
}
```

**私有直播请求示例**
```json
{
  "name": "内部会议",
  "visibility": "private",
  "streamer_name": "李四",
  "scheduled_start_time": "2024-01-01T14:00:00Z",
  "scheduled_end_time": "2024-01-01T16:00:00Z"
}
```

> 私有直播创建后会自动生成分享码，可通过分享码或分享链接访问。

**响应示例** (201 Created)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "name": "技术分享会",
  "description": "每周技术分享直播",
  "device_id": "camera-001",
  "status": "idle",
  "visibility": "public",
  "record_enabled": true,
  "record_files": [],
  "protocol": "",
  "bitrate": 0,
  "fps": 0,
  "streamer_name": "张三",
  "streamer_contact": "13800138000",
  "scheduled_start_time": "2024-01-01T14:00:00Z",
  "scheduled_end_time": "2024-01-01T16:00:00Z",
  "auto_kick_delay": 30,
  "actual_start_time": null,
  "actual_end_time": null,
  "last_frame_at": null,
  "current_viewers": 0,
  "total_viewers": 0,
  "peak_viewers": 0,
  "created_by": 1,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**推流地址**
- RTMP: `rtmp://{server}:1935/live/{stream_key}`
- RTSP: `rtsp://{server}:8554/live/{stream_key}`
- SRT: `srt://{server}:9000?streamid=#!::r=live/{stream_key},m=publish`

**播放地址**
- WebRTC: `webrtc://{server}:8000/live/{stream_key}`

**回放地址**（录制开启且直播结束后可用）
- HTTP: `http://{server}:8080/recordings/{record_file}`

> 多次开关录制会生成多个文件，通过 `record_files` 数组获取所有录制文件路径。

---

### 2.3 通过 ID 获取推流详情（管理员）

**接口地址**
```
GET /api/v1/streams/id/:id
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 直播 ID |

**请求示例**
```
GET /api/v1/streams/id/1
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "name": "技术分享会",
  "description": "每周技术分享直播",
  "device_id": "camera-001",
  "status": "ended",
  "visibility": "public",
  "record_enabled": true,
  "record_files": [
    "/recordings/2024/01/01/abc123def456_001.mp4",
    "/recordings/2024/01/01/abc123def456_002.mp4"
  ],
  "protocol": "rtmp",
  "bitrate": 2500,
  "fps": 30,
  "streamer_name": "张三",
  "streamer_contact": "13800138000",
  "scheduled_start_time": "2024-01-01T14:00:00Z",
  "scheduled_end_time": "2024-01-01T16:00:00Z",
  "auto_kick_delay": 30,
  "actual_start_time": "2024-01-01T14:05:00Z",
  "actual_end_time": "2024-01-01T16:10:00Z",
  "last_frame_at": "2024-01-01T16:10:00Z",
  "current_viewers": 0,
  "total_viewers": 3280,
  "peak_viewers": 512,
  "created_by": 1,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T16:10:00Z"
}
```

---

### 2.4 通过推流码获取推流详情

> 游客可访问公开直播；私有直播需要 access_token 或管理员权限

**接口地址**
```
GET /api/v1/streams/:key
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**查询参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| access_token | string | 否 | 私有直播访问令牌（通过分享码或分享链接获取） |

**请求示例**
```
GET /api/v1/streams/abc123def456
GET /api/v1/streams/abc123def456?access_token=xyz789...
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "name": "技术分享会",
  "description": "每周技术分享直播",
  "device_id": "camera-001",
  "status": "pushing",
  "visibility": "public",
  "record_enabled": true,
  "record_files": ["/recordings/2024/01/01/abc123def456_001.mp4"],
  "protocol": "rtmp",
  "bitrate": 2500,
  "fps": 30,
  "streamer_name": "张三",
  "streamer_contact": "13800138000",
  "scheduled_start_time": "2024-01-01T14:00:00Z",
  "scheduled_end_time": "2024-01-01T16:00:00Z",
  "auto_kick_delay": 30,
  "actual_start_time": "2024-01-01T14:05:00Z",
  "actual_end_time": null,
  "last_frame_at": "2024-01-01T15:30:00Z",
  "current_viewers": 128,
  "total_viewers": 1520,
  "peak_viewers": 256,
  "created_by": 1,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T14:05:00Z"
}
```

**错误响应**

404 Not Found:
```json
{
  "error": "stream not found"
}
```

403 Forbidden (私有直播无权限):
```json
{
  "error": "private stream requires access token"
}
```

---

### 2.5 验证分享码（游客）

> 游客通过此接口验证分享码，获取访问令牌

**接口地址**
```
POST /api/v1/shares/verify-code
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| share_code | string | 是 | 分享码（6位） |

**请求示例**
```json
{
  "share_code": "AB3XK9"
}
```

**响应示例** (200 OK)
```json
{
  "stream_key": "abc123def456",
  "token": "xyz789abc123...",
  "expires_at": "2024-01-01T16:00:00Z"
}
```

**使用方式**

获取 token 后，可通过以下方式访问私有直播：
1. 查询参数：`GET /api/v1/streams/:key?access_token={token}`
2. 分享链接：`https://example.com/live/{stream_key}?access_token={token}`

**错误响应**

404 Not Found:
```json
{
  "error": "invalid share code"
}
```

410 Gone:
```json
{
  "error": "stream has ended"
}
```

403 Forbidden:
```json
{
  "error": "share code max uses reached"
}
```

---

### 2.6 添加分享码（管理员）

> 管理员为私有直播添加分享码

**接口地址**
```
POST /api/v1/streams/:key/share-code
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| max_uses | int | 否 | 最大使用次数（0表示不限制） |

**请求示例**
```json
{
  "max_uses": 10
}
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "share_code": "AB3XK9",
  ...
}
```

---

### 2.7 重新生成分享码（管理员）

> 管理员可以重新生成私有直播的分享码，旧分享码将失效

**接口地址**
```
PUT /api/v1/streams/:key/share-code
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| max_uses | int | 否 | 最大使用次数（0表示不限制） |

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "share_code": "XY7PQ2",
  ...
}
```

---

### 2.8 更新分享码使用次数（管理员）

**接口地址**
```
PATCH /api/v1/streams/:key/share-code
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| max_uses | int | 是 | 最大使用次数（0表示不限制） |

**请求示例**
```json
{
  "max_uses": 20
}
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "share_code": "AB3XK9",
  "share_code_max_uses": 20,
  ...
}
```

---

### 2.9 删除分享码（管理员）

**接口地址**
```
DELETE /api/v1/streams/:key/share-code
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**响应示例** (200 OK)
```json
{
  "message": "share code deleted"
}
```

---

### 2.10 更新推流信息（管理员）

**接口地址**
```
PUT /api/v1/streams/:key
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 直播名称 |
| description | string | 否 | 直播描述 |
| device_id | string | 否 | 设备 ID |
| visibility | string | 否 | 可见性：`public`/`private` |
| share_code_max_uses | int | 否 | 分享码最大使用次数（0表示不限制） |
| record_enabled | bool | 否 | 是否开启录制（支持推流中动态修改） |
| streamer_name | string | 否 | 直播人员姓名 |
| streamer_contact | string | 否 | 直播人员联系方式 |
| scheduled_start_time | datetime | 否 | 预计开始时间 |
| scheduled_end_time | datetime | 否 | 预计结束时间 |
| auto_kick_delay | int | 否 | 超时断流延迟（分钟） |

**动态录制说明**

`record_enabled` 参数支持在推流过程中动态修改：

| 场景 | 行为 |
|------|------|
| 推流中开启录制 | 从当前时间点开始录制，不包含之前的内容 |
| 推流中关闭录制 | 立即停止录制，已录制内容保留 |
| 多次开关录制 | 每次开启会生成新的录制文件 |

> ⚠️ **注意**: 推流中途开启录制，录制文件只包含开启后的内容。如需完整录制，请在创建直播时开启。

**请求示例**
```json
{
  "name": "技术分享会（更新）",
  "scheduled_end_time": "2024-01-01T17:00:00Z",
  "auto_kick_delay": 60
}
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_key": "abc123def456",
  "name": "技术分享会（更新）",
  ...
}
```

---

### 2.11 删除推流码（管理员）

**接口地址**
```
DELETE /api/v1/streams/:key
```

**请求头**
```
Authorization: Bearer {access_token}
```

**响应示例** (200 OK)
```json
{
  "message": "deleted"
}
```

---

### 2.12 强制断流（管理员）

**接口地址**
```
POST /api/v1/streams/:key/kick
```

**请求头**
```
Authorization: Bearer {access_token}
```

**响应示例** (200 OK)
```json
{
  "message": "kicked"
}
```

---

## 3. 分享链接接口

> 管理员可以为私有直播创建分享链接，用户通过分享链接可以直接获取访问权限

### 3.1 获取分享链接列表（管理员）

**接口地址**
```
GET /api/v1/streams/:key/share-links
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**响应示例** (200 OK)
```json
{
  "share_links": [
    {
      "id": 1,
      "stream_id": 5,
      "token": "abc123xyz789...",
      "max_uses": 100,
      "used_count": 25,
      "created_by": 1,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 3.2 创建分享链接（管理员）

**接口地址**
```
POST /api/v1/streams/:key/share-links
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| key | string | 是 | 推流密钥 |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| max_uses | int | 否 | 最大使用次数（0表示不限制） |

**请求示例**
```json
{
  "max_uses": 100
}
```

**响应示例** (201 Created)
```json
{
  "id": 1,
  "stream_id": 5,
  "token": "abc123xyz789...",
  "max_uses": 100,
  "used_count": 0,
  "created_by": 1,
  "created_at": "2024-01-01T10:00:00Z"
}
```

---

### 3.3 更新分享链接使用次数（管理员）

**接口地址**
```
PATCH /api/v1/streams/share-links/:id
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 分享链接 ID |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| max_uses | int | 是 | 最大使用次数（0表示不限制） |

**请求示例**
```json
{
  "max_uses": 200
}
```

**响应示例** (200 OK)
```json
{
  "id": 1,
  "stream_id": 5,
  "token": "abc123xyz789...",
  "max_uses": 200,
  "used_count": 25,
  "created_by": 1,
  "created_at": "2024-01-01T10:00:00Z"
}
```

---

### 3.4 删除分享链接（管理员）

**接口地址**
```
DELETE /api/v1/streams/share-links/:id
```

**请求头**
```
Authorization: Bearer {access_token}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 分享链接 ID |

**响应示例** (200 OK)
```json
{
  "message": "share link deleted"
}
```

---

### 3.5 验证分享链接（游客）

> 用户通过分享链接访问时，验证 token 获取访问权限

**接口地址**
```
GET /api/v1/shares/link/:token
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| token | string | 是 | 分享链接 token |

**响应示例** (200 OK)
```json
{
  "stream_key": "test-stream-004",
  "token": "xyz789abc123...",
  "expires_at": "2024-01-01T18:00:00Z"
}
```

**错误响应**

404 Not Found:
```json
{
  "error": "invalid share link"
}
```

410 Gone:
```json
{
  "error": "stream has ended"
}
```

403 Forbidden:
```json
{
  "error": "share link max uses reached"
}
```

---

## 4. 系统接口

### 4.1 健康检查

**接口地址**
```
GET /api/v1/system/health
```

**无需认证**

**响应示例** (200 OK)
```json
{
  "status": "ok"
}
```

---

### 4.2 系统统计（管理员）

**接口地址**
```
GET /api/v1/system/stats
```

**请求头**
```
Authorization: Bearer {access_token}
```

**响应示例** (200 OK)
```json
{
  "online_streams": 5,
  "total_streams": 100
}
```

---

## 5. ZLMediaKit Hook 接口

> 这些接口由 ZLMediaKit 流媒体服务器调用，无需认证

### 5.1 推流开始回调

```
POST /api/v1/hooks/on_publish
```

**请求示例**
```json
{
  "app": "live",
  "stream": "abc123def456",
  "schema": "rtmp",
  "mediaServerId": "zlm-server-1",
  "ip": "192.168.1.100",
  "port": 12345
}
```

**验证逻辑**

系统会对推流请求进行以下验证：

| 验证项 | 说明 |
|-------|------|
| stream_key 存在性 | 推流码必须是通过管理接口创建的有效推流码 |
| 状态检查 | 推流码状态不能为 `ended` |

**响应示例**

验证通过 (允许推流):
```json
{
  "code": 0,
  "msg": "success"
}
```

验证失败 (拒绝推流):
```json
{
  "code": -1,
  "msg": "stream not found"
}
```

| 错误信息 | 说明 |
|---------|------|
| stream not found | 推流码不存在 |
| stream expired | 推流码已结束 |

> ⚠️ **安全说明**: 无效或不存在的推流码将被拒绝，ZLMediaKit 会自动断开该推流连接。

### 5.2 推流结束回调

```
POST /api/v1/hooks/on_unpublish
```

> 推流结束时，系统会自动清理该直播的所有访问令牌（分享码和分享链接生成的令牌都会失效）

### 5.3 流量统计回调

```
POST /api/v1/hooks/on_flow_report
```

### 5.4 无人观看回调

```
POST /api/v1/hooks/on_stream_none_reader
```

### 5.5 播放开始回调

```
POST /api/v1/hooks/on_play
```

**请求示例**
```json
{
  "app": "live",
  "stream": "abc123def456",
  "schema": "rtmp",
  "mediaServerId": "zlm-server-1",
  "ip": "192.168.1.100",
  "port": 12345,
  "id": "player-unique-id"
}
```

**说明**: 当有观众开始观看直播时，ZLMediaKit 会调用此接口。系统会自动增加当前观看人数和累计观看人次。

### 5.6 播放器断开回调

```
POST /api/v1/hooks/on_player_disconnect
```

**请求示例**
```json
{
  "app": "live",
  "stream": "abc123def456",
  "schema": "rtmp",
  "mediaServerId": "zlm-server-1",
  "ip": "192.168.1.100",
  "port": 12345,
  "id": "player-unique-id"
}
```

**说明**: 当观众离开直播时，ZLMediaKit 会调用此接口。系统会自动减少当前观看人数。

---

## 数据模型

### User (用户)

```typescript
{
  id: number              // 用户 ID
  username: string        // 用户名
  role: string            // 角色: admin / operator / viewer
  email: string           // 邮箱
  phone: string           // 电话
  real_name: string       // 真实姓名
  avatar: string          // 头像 URL
  department: string      // 部门
  status: string          // 状态: active / disabled
  last_login_at: string   // 最后登录时间
  created_at: string      // 创建时间
  updated_at: string      // 更新时间
}
```

### Stream (推流)

```typescript
{
  id: number                    // 推流 ID
  stream_key: string            // 推流密钥
  name: string                  // 直播名称
  description: string           // 直播描述
  device_id: string             // 设备 ID
  status: string                // 状态: idle / pushing / ended
  visibility: string            // 可见性: public / private
  share_code: string            // 分享码（私有直播自动生成，8位）
  share_code_max_uses: number   // 分享码最大使用次数（0表示不限制）
  share_code_used_count: number // 分享码已使用次数
  record_enabled: boolean       // 是否开启录制
  record_files: string[]        // 录制文件路径列表（多次开关录制会生成多个文件）
  protocol: string              // 协议: rtmp / rtsp / srt
  bitrate: number               // 码率 (kbps)
  fps: number                   // 帧率
  streamer_name: string         // 直播人员姓名
  streamer_contact: string      // 直播人员联系方式
  scheduled_start_time: string  // 预计开始时间
  scheduled_end_time: string    // 预计结束时间
  auto_kick_delay: number       // 超时断流延迟（分钟）
  actual_start_time: string     // 实际开始时间
  actual_end_time: string       // 实际结束时间
  last_frame_at: string         // 最后一帧时间
  // 观看统计
  current_viewers: number       // 当前观看人数
  total_viewers: number         // 累计观看人次
  peak_viewers: number          // 峰值观看人数
  created_by: number            // 创建者用户 ID
  created_at: string            // 创建时间
  updated_at: string            // 更新时间
}
```

### ShareLink (分享链接)

```typescript
{
  id: number              // 分享链接 ID
  stream_id: number       // 关联的直播 ID
  token: string           // 分享链接 token（64位）
  max_uses: number        // 最大使用次数（0表示不限制）
  used_count: number      // 已使用次数
  created_by: number      // 创建者用户 ID
  created_at: string      // 创建时间
  stream: Stream          // 关联的直播信息（可选）
}
```

### StreamAccessToken (私有直播访问令牌)

```typescript
{
  stream_key: string      // 推流密钥
  token: string           // 访问令牌
  expires_at: string      // 过期时间
}
```

---

## 错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 无效 |
| 403 | 禁止访问（如私有直播无权限） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 常见错误信息

| 错误信息 | 说明 |
|---------|------|
| invalid credentials | 用户名或密码错误 |
| invalid or expired refresh token | 刷新令牌无效或已过期 |
| stream not found | 推流不存在 |
| private stream requires access token | 私有直播需要访问令牌 |
| invalid share code | 分享码无效 |
| invalid share link | 分享链接无效 |
| share code max uses reached | 分享码使用次数已达上限 |
| share link max uses reached | 分享链接使用次数已达上限 |
| stream has ended | 直播已结束 |
| only private streams support sharing | 仅私有直播支持分享功能 |

---

## 超时自动断流机制

系统会每分钟检查正在推流的直播，当满足以下条件时自动断流：

```
当前时间 > 预计结束时间 + 超时延迟时间
```

例如：
- 预计结束时间：16:00
- 超时延迟：30 分钟
- 自动断流时间：16:30

管理员可在创建或更新直播时设置 `auto_kick_delay` 参数。

---

## 私有直播访问机制

私有直播支持两种访问方式：

### 1. 分享码访问

- 私有直播创建时自动生成 8 位分享码
- 用户输入分享码验证后获取访问令牌
- 支持设置最大使用次数限制
- 直播结束后分享码自动失效
- 管理员可重新生成分享码（旧分享码失效）

**访问流程**:
```
1. 用户获取分享码（由管理员提供）
2. 调用 POST /api/v1/shares/verify-code 验证分享码
3. 获取 access_token
4. 使用 access_token 访问直播内容
```

### 2. 分享链接访问

- 管理员手动创建分享链接（64位 token）
- 用户通过链接直接获取访问权限
- 支持设置最大使用次数限制
- 直播结束后分享链接自动失效
- 可创建多个分享链接

**访问流程**:
```
1. 管理员创建分享链接
2. 用户点击分享链接（包含 token 参数）
3. 前端调用 GET /api/v1/shares/link/:token 验证 token
4. 获取 access_token
5. 使用 access_token 访问直播内容
```

---

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

> ⚠️ **安全提示**: 生产环境请务必修改默认密码！

---

**文档版本**: v2.1
**最后更新**: 2026-01-16
