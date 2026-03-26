# 产品需求文档（PRD）：学生管理系统

> **版本**：v0.1.0 · **状态**：草稿 · **更新**：2026-03-26

---

## 一、项目背景与目标

### 1.1 背景

**面向对象**：初中学校（初一 ~ 初三，共 9 门主科）。传统纸质或 Excel 管理效率低、难协作。本系统旨在提供一套 **Web 端初中生管理平台**，实现学生信息、班级、课程、成绩的数字化管理。

### 1.2 核心目标

- 🎯 集中管理学生、班级、教师、课程信息
- 📊 多维度成绩分析（班级排名、年级排名、学科趋势）
- 🔐 基于角色的权限控制，保护数据安全
- 📱 响应式设计，桌面端为主

---

## 二、技术栈（现有）

| 层次 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| 数据库 & 认证 | Supabase (PostgreSQL + Auth) |
| 表单 | react-hook-form + zod |
| 图标 | lucide-react |
| 运行时 | Node.js / Vercel |

---

## 三、用户角色

| 角色 | 说明 | 权限范围 |
|------|------|---------|
| **超级管理员** | 系统最高权限 | 所有功能 + 用户管理 + 系统设置 |
| **教务管理员** | 日常校务操作 | 学生/班级/课程/成绩 CRUD |
| **教师** | 任课教师 | 查看所属班级 & 课程，录入/修改成绩 |
| **（预留）学生** | 学生本人 | 查看个人信息与成绩 |

---

## 四、功能模块

### 4.1 认证模块 ✅ 已有骨架

| 功能 | 状态 | 说明 |
|------|------|------|
| 账号密码登录 | 🟡 骨架 | Supabase Auth，需接通真实逻辑 |
| 用户注册 | 🟡 骨架 | 需注册后由管理员分配角色 |
| 登出 | ✅ 已实现 | Header 下拉菜单 → 退出登录 |
| 路由保护中间件 | ✅ 已实现 | [middleware.ts](file:///Users/moliang/Desktop/coder/bc-tools/src/middleware.ts) 未登录重定向 `/login` |
| 忘记密码 / 重置密码 | ❌ 待开发 | Supabase 邮件重置 |

---

### 4.2 仪表盘（Dashboard）✅ 已有骨架

**页面路由**：`/`

| 组件 | 状态 | 说明 |
|------|------|------|
| 统计卡片（学生/班级/教师/课程总数） | 🟡 静态数据 | 需从 Supabase 动态拉取 |
| 入学趋势折线图 | ❌ 占位符 | 需集成图表库（推荐 Recharts） |
| 最近动态列表 | 🟡 静态数据 | 需对接操作日志 |
| 快速操作入口 | ❌ 待开发 | 快速添加学生、发布通知等 |

---

### 4.3 学生管理 🟡 进行中

**页面路由**：`/students`、`/students/[id]`、`/students/new`

#### 4.3.1 学生列表页

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 表格展示（学号/姓名/性别/班级/状态） | P0 | 基础骨架已有，需接真实数据 |
| 关键词搜索（姓名、学号） | P0 | 前端过滤或 Supabase 查询 |
| 按班级/状态筛选 | P1 | 下拉筛选器 |
| 分页 | P0 | 建议每页 20 条 |
| 批量操作（导出、批量删除） | P2 | CSV 导出 |
| 添加学生按钮 | P0 | 跳转新建页或弹窗 |

#### 4.3.2 学生详情 / 编辑页

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 学号 | string | ✅ | 系统自动生成，格式 `YYYY + 自增4位` |
| 姓名 | string | ✅ | |
| 性别 | enum | ✅ | 男 / 女 |
| 出生日期 | date | ✅ | |
| 所属班级 | 外键 | ✅ | 关联班级表 |
| 联系电话 | string | | 家长/本人 |
| 家庭住址 | string | | |
| 入学日期 | date | ✅ | |
| 状态 | enum | ✅ | 在校 / 请假 / 休学 / 毕业 / 退学 |
| 头像 | image | | Supabase Storage |
| 备注 | text | | |

#### 4.3.3 数据模型（Supabase / PostgreSQL）

```sql
CREATE TABLE students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_no  TEXT NOT NULL UNIQUE,   -- 学号
  name        TEXT NOT NULL,
  gender      TEXT CHECK (gender IN ('男','女')),
  birth_date  DATE,
  class_id    UUID REFERENCES classes(id),
  phone       TEXT,
  address     TEXT,
  enrolled_at DATE NOT NULL,
  status      TEXT DEFAULT '在校'
               CHECK (status IN ('在校','请假','休学','毕业','退学')),
  avatar_url  TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### 4.4 班级管理 ❌ 待开发

**页面路由**：`/classes`、`/classes/[id]`

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 班级列表 | P0 | 含班级名称、年级、班主任、学生人数 |
| 新建 / 编辑班级 | P0 | |
| 班级详情（学生名单） | P1 | 展示该班所有学生 |
| 删除班级（需无在读学生） | P2 | 含保护逻辑 |

```sql
CREATE TABLE classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,          -- 如"计算机科学1班"
  grade       TEXT,                   -- 如"2024级"
  teacher_id  UUID REFERENCES teachers(id),  -- 班主任
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### 4.5 教师管理 ❌ 待开发

**页面路由**：`/teachers`、`/teachers/[id]`

| 字段 | 说明 |
|------|------|
| 教师编号 | 系统自动生成 |
| 姓名、性别、联系方式 | 基础信息 |
| 所属学科 | 如数学、物理 |
| 担任班主任 | 关联班级（可空） |
| 账号关联 | 关联 Supabase Auth 用户 |

```sql
CREATE TABLE teachers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_no  TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  gender      TEXT,
  phone       TEXT,
  subject     TEXT,
  user_id     UUID REFERENCES auth.users(id),  -- 关联登录账号
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### 4.6 课程管理 ❌ 待开发

**页面路由**：`/courses`、`/courses/[id]`

| 字段 | 说明 |
|------|------|
| 课程名称 | 如"高等数学" |
| 课程编码 | 唯一标识 |
| 任课教师 | 关联教师 |
| 开设班级 | 多对多 |
| 学时 / 学分 | |
| 学期 | 如"2024-2025学年第一学期" |

```sql
CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  teacher_id  UUID REFERENCES teachers(id),
  max_score   NUMERIC(5,1) NOT NULL DEFAULT 100,  -- 满分可配置，如 100 / 150
  hours       INTEGER,
  semester    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 课程与班级的多对多
CREATE TABLE course_classes (
  course_id   UUID REFERENCES courses(id),
  class_id    UUID REFERENCES classes(id),
  PRIMARY KEY (course_id, class_id)
);
```

---

### 4.7 成绩管理 ❌ 待开发

**页面路由**：`/grades`、`/grades/analysis`

**初中主科（9 门）**：语文、数学、英语、物理、化学、历史、地理、政治、生物

#### 录入与查询

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 按班级 + 科目批量录入成绩 | P0 | 支持表格内联编辑 |
| Excel 导入成绩 / 学生名单 | P0 | 模板下载 → 填写 → 上传，自动解析 |
| 成绩查询（学生 / 班级 / 科目 / 学期维度） | P0 | 多条件筛选 |
| 成绩修改留痕 | P1 | 记录修改人和修改前值 |
| CSV / Excel 导出 | P1 | 供家长会、教研使用 |

#### 成绩分析（⭐ 核心亮点）

| 分析维度 | 优先级 | 说明 |
|----------|--------|------|
| 班级排名 / 年级排名 | P0 | 每次考试自动计算 |
| 个人总分趋势图 | P0 | 多次考试折线图，直观看进退步 |
| 科目平均分对比（班级 vs 年级） | P1 | 柱状图，发现薄弱班级 |
| 成绩分布统计（优/良/及格/不及格） | P1 | 饼图 / 环形图 |
| 单科薄弱学生预警 | P2 | 低于 60 分自动标红提示 |
| 进步/退步幅度排行榜 | P2 | 正向激励学生 |

```sql
-- 考试场次
CREATE TABLE exams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,   -- 如"2024-2025第一学期期中考试"
  exam_type   TEXT,            -- 期中 / 期末 / 月考
  semester    TEXT NOT NULL,   -- 如"2024-2025-1"
  exam_date   DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 成绩明细（满分由 courses.max_score 决定，业务层校验）
CREATE TABLE grades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id     UUID REFERENCES exams(id),
  student_id  UUID REFERENCES students(id),
  course_id   UUID REFERENCES courses(id),
  score       NUMERIC(5,2),    -- 实际得分，满分见 courses.max_score
  rank_class  INTEGER,         -- 班级排名（自动计算）
  rank_grade  INTEGER,         -- 年级排名（自动计算）
  entered_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (exam_id, student_id, course_id)
);
```

---

### 4.8 通知公告 ❌ 待开发（P2）

- 管理员发布公告
- 支持按角色推送
- Header 铃铛图标显示未读数

---

### 4.9 系统设置 ❌ 待开发

**页面路由**：`/settings`

| 功能 | 说明 |
|------|------|
| 个人信息编辑 | 头像、昵称、密码修改 |
| 用户管理 | 超级管理员可管理所有用户 |
| 角色权限配置 | RBAC 配置 |
| 操作日志查看 | 审计日志 |
| 学期管理 | 新建/切换学期 |

---

## 五、非功能性需求

| 类型 | 要求 |
|------|------|
| 性能 | 列表页首屏 < 2s，分页查询 < 500ms |
| 安全 | 基于 Supabase RLS 行级安全策略控制数据访问 |
| 响应式 | 桌面优先，支持平板 |
| 可用性 | 服务可用率 ≥ 99.5% |
| 数据安全 | 敏感字段加密，操作留审计日志 |

---

## 六、迭代计划

### Phase 1（基础建设）

- [ ] 完善认证：忘记密码、角色绑定
- [ ] 建立 Supabase 数据库表结构（含 RLS）
- [ ] 学生管理：列表页接入真实数据 + 增删改查
- [ ] 仪表盘：统计数据动态化

### Phase 2（核心功能）

- [ ] 班级管理完整 CRUD
- [ ] 教师管理完整 CRUD
- [ ] 课程管理完整 CRUD
- [ ] 成绩录入与查询

### Phase 3（增强功能）

- [ ] 成绩统计图表（Recharts）
- [ ] 通知公告系统
- [ ] CSV/Excel 导入导出
- [ ] 操作日志与审计

### Phase 4（优化）

- [ ] 移动端适配
- [ ] 深色主题
- [ ] 性能优化（虚拟滚动、缓存策略）
- [ ] 学生端门户（只读查询）

---

## 七、已确认事项

| 问题 | 确认结果 |
|------|---------|
| 学校类型 | ✅ 初中（初一 ~ 初三） |
| 成绩分析 | ✅ 需要 |
| 成绩满分 | ✅ 课程级别可配置（`courses.max_score`，默认 100） |
| Excel 导入 | ✅ 需要（学生名单 + 成绩导入，P0） |
| 考勤模块 | ❌ 不需要 |
| 家长端 | ❌ 不需要 |
| 学生规模 | ⏳ 待确认（不影响当前开发） |
