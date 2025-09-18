# การตั้งค่า Trello MCP Integration

## ขั้นตอนการรับ Trello API Credentials

### 1. รับ Trello API Key และ Token

1. **เข้าสู่ระบบ Trello** ที่ [https://trello.com](https://trello.com)

2. **ไปที่หน้า Developer API Keys** ที่ [https://trello.com/app-key](https://trello.com/app-key)

3. **คัดลอก API Key** ที่แสดงในหน้า (มีลักษณะเป็น string ยาวๆ)

4. **สร้าง Token** โดยคลิกที่ลิงก์ "Token" หรือไปที่:
   ```
   https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=MCP%20Server&key=YOUR_API_KEY_HERE
   ```
   (แทนที่ `YOUR_API_KEY_HERE` ด้วย API Key ของคุณ)

5. **อนุญาต** การเข้าถึงและคัดลอก Token ที่ได้รับ

### 2. อัพเดท MCP Configuration

1. **เปิดไฟล์** `C:\Users\WINDOWS 11\.cursor\mcp.json`

2. **แทนที่** `your_trello_api_key_here` และ `your_trello_token_here` ด้วยค่าจริงที่คุณได้รับ:

```json
{
  "mcpServers": {
    "trello": {
      "command": "mcp-server-trello",
      "args": [],
      "env": {
        "TRELLO_API_KEY": "paste_your_actual_api_key_here",
        "TRELLO_TOKEN": "paste_your_actual_token_here"
      }
    }
  }
}
```

### 3. รีสตาร์ท Cursor

หลังจากอัพเดท configuration แล้ว ให้:
1. **ปิด Cursor IDE**
2. **เปิด Cursor ใหม่**
3. **ทดสอบ** การเชื่อมต่อโดยลองใช้คำสั่งเกี่ยวกับ Trello

## คำสั่งที่ใช้ได้กับ Trello MCP

เมื่อตั้งค่าเสร็จแล้ว คุณจะสามารถใช้คำสั่งเหล่านี้ใน Cursor:

- **ดู boards ทั้งหมด**: "Show me all my Trello boards"
- **ดู lists ใน board**: "Show lists in [board name]"
- **ดู cards ใน list**: "Show cards in [list name]"
- **สร้าง card ใหม่**: "Create a new card in [list name] with title [title]"
- **อัพเดท card**: "Update card [card name] with description [description]"
- **ย้าย card**: "Move card [card name] to [list name]"

## การแก้ไขปัญหา

หากมีปัญหา:
1. **ตรวจสอบ API Key และ Token** ว่าถูกต้อง
2. **ตรวจสอบ network connection** ว่าเชื่อมต่ออินเทอร์เน็ตได้
3. **ตรวจสอบ permissions** ของ Token ว่าให้สิทธิ์ read/write
4. **รีสตาร์ท Cursor** อีกครั้ง

## ความปลอดภัย

⚠️ **คำเตือน**: 
- อย่าแชร์ API Key และ Token กับคนอื่น
- เก็บข้อมูลเหล่านี้ให้ปลอดภัย
- หากสงสัยว่า Token หลุด ให้ไป revoke และสร้างใหม่ที่ Trello Developer page
