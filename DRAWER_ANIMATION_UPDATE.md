# 抽屉动画更新说明

## 📋 更新概述

本次更新将 Sheet 组件（抽屉）的动画效果优化为 Element UI 风格，提供更流畅、更自然的用户体验。

## 🎯 主要变更

### 1. 修改的文件

#### `src/components/ui/sheet.tsx`
- ✅ 优化遮罩层动画，使用更平滑的 cubic-bezier 缓动函数
- ✅ 使用自定义的滑动动画替换默认的 Tailwind 动画
- ✅ 添加内容延迟淡入效果，提升视觉层次感
- ✅ 调整阴影效果，更接近 Element UI 设计风格

#### `src/app/globals.css`
- ✅ 新增 `slide-in-right` 和 `slide-out-right` 动画（右侧抽屉）
- ✅ 新增 `slide-in-left` 和 `slide-out-left` 动画（左侧抽屉）
- ✅ 新增 `content-fade-in` 动画（内容淡入效果）

## 🎨 动画特性

### Element UI 风格特点

| 特性 | 说明 |
|------|------|
| **平滑滑动** | 抽屉从侧边平滑滑入，持续时间 300ms |
| **遮罩淡入** | 背景遮罩同步淡入，透明度 50% |
| **内容延迟** | 抽屉内容延迟 100ms 后淡入，避免视觉突兀 |
| **缓动函数** | 使用 `ease-out`（进入）和 `ease-in`（退出） |

### 动画时间轴

```
0ms     ▶ 抽屉开始滑入 + 遮罩淡入
300ms   ▶ 抽屉完全显示
100ms   ▶ 内容开始淡入
400ms   ▶ 内容完全显示
```

## 💡 使用方式

### 基本用法（无需修改现有代码）

```tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger>打开抽屉</SheetTrigger>
  <SheetContent side="right">
    {/* 您的内容会自动应用新动画 */}
  </SheetContent>
</Sheet>
```

### 支持的方向

```tsx
{/* 从右侧滑入（默认） */}
<SheetContent side="right">...</SheetContent>

{/* 从左侧滑入 */}
<SheetContent side="left">...</SheetContent>

{/* 从顶部滑入 */}
<SheetContent side="top">...</SheetContent>

{/* 从底部滑入 */}
<SheetContent side="bottom">...</SheetContent>
```

## 🔧 自定义配置

### 调整动画速度

如需修改动画速度，编辑 `src/app/globals.css` 中的关键帧：

```css
/* 更快的动画（200ms） */
data-[state=open]:animate-[slide-in-right_0.2s_ease-out]
data-[state=closed]:animate-[slide-out-right_0.2s_ease-in]

/* 更慢的动画（500ms） */
data-[state=open]:animate-[slide-in-right_0.5s_ease-out]
data-[state=closed]:animate-[slide-out-right_0.5s_ease-in]
```

### 调整遮罩透明度

编辑 `src/components/ui/sheet.tsx` 中的 `SheetOverlay`：

```tsx
// 更深的遮罩（60%）
bg-black/60

// 更浅的遮罩（30%）
bg-black/30
```

## 🎭 效果对比

### 更新前
- ❌ 动画较生硬，缺乏流畅感
- ❌ 内容和抽屉同时出现，视觉混乱
- ❌ 缓动函数不够自然

### 更新后
- ✅ 平滑的滑动效果，类似 Element UI
- ✅ 内容延迟淡入，层次分明
- ✅ 使用专业的缓动函数，动画自然流畅
- ✅ 阴影和遮罩效果更精致

## 📝 注意事项

1. **向后兼容**：现有代码无需修改，自动应用新动画
2. **性能优化**：使用 CSS 动画，GPU 加速，性能优异
3. **暗黑模式**：动画效果在暗黑模式下同样流畅
4. **响应式设计**：动画在不同屏幕尺寸下均表现良好

## 🚀 技术细节

### 关键技术点

1. **Radix UI Dialog** - 基础组件，提供可访问性支持
2. **CSS Keyframes** - 自定义动画，精确控制每一帧
3. **Tailwind Arbitrary Values** - 动态动画配置
4. **Animation Fill Mode** - 保持动画结束状态

### 浏览器兼容性

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📚 相关资源

- [Element UI Drawer 文档](https://element.eleme.io/#/zh-CN/component/drawer)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [CSS Animation 指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Animations)

## 🎉 总结

通过这次更新，抽屉组件现在具有：
- 更专业的动画效果
- 更好的用户体验
- 与 Element UI 一致的视觉风格
- 完全的可定制性

如有任何问题或建议，欢迎反馈！