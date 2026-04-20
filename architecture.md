# WhisperX Nexus Omega Architecture

แพลตฟอร์มนี้ถูกออกแบบเป็นระบบ All-in-One สำหรับงาน visual collaboration, AI orchestration และการจัดการโมดูลธุรกิจภายในอินเทอร์เฟซเดียว โดยแบ่งประสบการณ์ใช้งานออกเป็นสองชั้นหลัก ได้แก่ **public experience** สำหรับหน้า Landing และการนำเสนอคุณค่าของผลิตภัณฑ์ และ **authenticated workspace** สำหรับ Dashboard และโมดูลการทำงานทั้งหมดภายใต้ sidebar navigation เดียวกัน

| Area | Purpose | Key Entities | Access |
| --- | --- | --- | --- |
| Landing | สื่อสารคุณค่าแพลตฟอร์มและแปลงผู้เยี่ยมชมเป็นผู้ใช้งาน | marketing sections, CTA, feature previews | public |
| Workspace Dashboard | แสดงภาพรวมระบบและทางลัดสู่โมดูลหลัก | workspace stats, recent activity, quick actions | authenticated |
| Canvas / Whiteboard | พื้นที่ทำงานเชิงภาพสำหรับวาดและทำงานร่วมกัน | boards, board elements, comments, sessions | authenticated |
| Diagram Builder | สร้าง flowchart และ mind map | diagrams, nodes, edges, diagram templates | authenticated |
| AI Workflow Studio | ออกแบบขั้นตอนอัตโนมัติที่เชื่อม LLM | workflows, workflow steps, runs, prompts | authenticated |
| Skill Creator | จัดการ skill และ prompt templates | skills, skill versions, tests, test runs | authenticated |
| Analytics | วิเคราะห์การใช้งานและผลลัพธ์จากระบบ | events, metrics, activity snapshots | authenticated |
| File Hub | จัดการไฟล์ของ canvas และ workflow | file assets, uploads, file links | authenticated |
| Collaboration | การทำงานแบบร่วมมือและการแจ้งเตือน | collaboration sessions, notifications | authenticated |

บทบาทของผู้ใช้แบ่งอย่างชัดเจนระหว่าง **admin** และ **user** โดยผู้ใช้ทุกคนสามารถเข้าถึง workspace และโมดูลเชิงปฏิบัติการพื้นฐานได้ ขณะที่ admin จะมีสิทธิ์เพิ่มเติมสำหรับการกำกับดูแลสมาชิก การจัดการเทมเพลตส่วนกลาง การตรวจสอบ analytics เชิงลึก และการเข้าถึง operation controls ที่มีผลกับทั้งระบบ

| Role | Permissions |
| --- | --- |
| user | ใช้งาน dashboard, canvas, diagram, workflow, skill templates ส่วนตัว, file uploads ของตนเอง และ collaboration ใน workspace ที่เข้าถึงได้ |
| admin | สิทธิ์ทั้งหมดของ user พร้อมความสามารถในการจัดการสมาชิก, ดู analytics ระดับระบบ, จัดการ global templates, ตรวจสอบกิจกรรม, และส่ง notification เชิงระบบ |

แนวทางข้อมูลจะใช้ตารางหลักที่สัมพันธ์กันตามขอบเขตการใช้งานจริง โดยเริ่มจาก users เป็นแกนกลาง จากนั้นเชื่อมไปยัง workspaces, boards, diagrams, workflows, skills, file assets, notifications และ activity events เพื่อให้ทุกโมดูลอ้างอิงเจ้าของข้อมูลและประวัติการแก้ไขได้อย่างสอดคล้องกัน ในชั้นการพัฒนาเริ่มต้นจะมุ่งสร้างข้อมูลตัวอย่างและ API contracts ที่ชัดเจนก่อนขยายไปสู่ persistence แบบเต็มรูปแบบ

ประสบการณ์ใช้งานหลักจะยึดแนวคิด **single unified workspace** ผู้ใช้สามารถสลับไปมาระหว่างภาพรวม, การแก้ไขงานเชิงภาพ, การตั้งค่า AI workflow, การจัดการ skill และการดู analytics ได้ผ่าน sidebar เดียว โดยรักษาภาษาออกแบบเดียวกันทั้งระบบ ผ่าน dark luxury visual system, spacing ที่นิ่ง, typography ที่ชัดเจน, และ micro-interactions ที่ช่วยให้แอปดูเป็นเครื่องมือระดับมืออาชีพแทนการเป็นเพียงชุดหน้าจอแยกส่วน
