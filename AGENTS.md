<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Git Commit 与 Pull Request 规范

## 1. 基本原则

每次开始修改前，先检查当前分支、工作区状态和已有改动。

```bash
git status -sb
git branch --show-current
```

不要直接在 `main` 分支上开发。每个独立任务必须新建分支。

```bash
git checkout -b <type>/<short-description>
```

一个 commit 只处理一个明确目的。不要把无关改动混在同一个 commit 中。

提交前必须检查：

```bash
git status
git diff
```

如果项目提供 lint、build 或测试命令，提交前应尽量执行：

```bash
npm run lint
npm run build
```

如果检查无法通过，需要在 PR 描述中如实说明原因。不要隐藏失败项。

## 2. Commit Message 标准格式

使用以下格式：

```text
<type>(<scope>): <summary>
```

其中：

- `<type>`：改动类型；
- `<scope>`：改动范围，可选；
- `<summary>`：一句简洁的英文说明，使用动词开头，不加句号。

推荐示例：

```text
feat(hero): add background video with gradient overlay
fix(nav): prevent mobile menu from covering hero content
style(homepage): refine section spacing and typography
refactor(agent): simplify negotiation message rendering
docs(readme): add local development instructions
chore(deps): update frontend dependencies
```

## 3. 可用的 type

| Type       | 使用场景                                    |
| ---------- | ------------------------------------------- |
| `feat`     | 新增功能、交互或页面能力                    |
| `fix`      | 修复 bug、异常或兼容性问题                  |
| `style`    | 只调整 UI、样式、排版、动画，不改变业务逻辑 |
| `refactor` | 重构代码，但不改变外部功能                  |
| `perf`     | 性能优化                                    |
| `docs`     | 修改 README、说明文档或注释                 |
| `test`     | 新增或调整测试                              |
| `chore`    | 依赖、配置、构建脚本、工程维护              |
| `revert`   | 回滚此前改动                                |

## 4. Scope 命名建议

优先使用模块名或页面名，例如：

```text
hero
homepage
nav
footer
market
creator
backer
agent
studio
wallet
auth
api
deps
config
```

如果改动跨多个模块，可以省略 scope：

```text
style: unify homepage section spacing
```

## 5. Summary 编写规则

Summary 必须：

- 使用英文；
- 使用小写字母开头；
- 使用动词原形；
- 控制在约 72 个字符以内；
- 描述“做了什么”，不要只写模糊词语。

推荐：

```text
feat(hero): add autoplay background video
fix(homepage): reduce layout shift during initial render
style(nav): improve glassmorphism effect
```

不要使用：

```text
update
fix bug
homepage changes
final version
test
new
modify files
```

## 6. Branch 命名规则

使用以下格式：

```text
<type>/<short-description>
```

示例：

```text
feat/hero-video-background
style/homepage-visual-polish
fix/mobile-nav-overlay
refactor/agent-chat-rendering
docs/local-development-guide
```

分支名使用英文小写，单词之间用连字符 `-`。

## 7. Pull Request 标准

完成修改后：

```bash
git add .
git commit -m "<type>(<scope>): <summary>"
git push -u origin <branch-name>
```

然后创建 PR。

PR 标题应与核心 commit 风格一致，例如：

```text
feat(hero): add background video with gradient overlay
```

PR 描述必须包含：

```markdown
## Summary

- 本次改动完成了什么
- 修改了哪些模块

## Key Changes

- 关键改动 1
- 关键改动 2
- 关键改动 3

## Validation

- [ ] npm run lint
- [ ] npm run build
- [ ] 已在本地浏览器检查主要页面
- [ ] 已检查移动端布局
- [ ] 未修改无关文件

## Notes

- 尚未解决的问题
- 需要人工确认的内容
- 可能存在的风险
```

## 8. AI 执行约束

执行任何任务时：

1. 先阅读现有代码和项目结构；
2. 不要修改与需求无关的文件；
3. 不要擅自删除现有功能；
4. 不要直接 push 到 `main`；
5. 新建独立分支；
6. 修改完成后运行可用的检查命令；
7. 使用符合规范的 commit message；
8. push 分支并创建 PR；
9. 在最终回复中列出：
   - 分支名；
   - commit message；
   - PR 标题；
   - 修改文件列表；
   - 校验结果；
   - 尚未完成或需要人工确认的内容。

如果需求不明确，先输出方案并等待确认，不要直接大范围改动。
