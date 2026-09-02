# 将 SkillPack One 发布到 npm

SkillPack One 通过经过审核的 GitHub Release 和 npm Trusted Publishing 发布。长期流程使用短时 OIDC 凭证，不在仓库保存 `NPM_TOKEN`；公开仓库中的公开包会由 npm 自动生成 provenance。

## 工作流强制约束

`.github/workflows/publish-npm.yml` 会：

- 只在 GitHub Release 发布时运行；
- 要求标签对应提交可从 `origin/main` 到达；
- 要求标签严格等于 `v<package.json version>`；
- 要求 GitHub prerelease 标记与 SemVer 一致；
- 预发布版本进入 npm `next`，稳定版本才进入 `latest`；
- 发布前运行完整的 `npm run ci` 与 `npm pack --dry-run`；
- 使用 GitHub 托管 Runner、`npm` Environment，以及最小的 `contents: read`、`id-token: write` 权限；
- 在高权限发布任务中关闭包管理器缓存，并禁止依赖安装生命周期脚本。

## 新 npm 包的一次性首次发布

npm 要求包已经存在，才能绑定 Trusted Publisher。编写本文档时，`skillpack-one` 尚未被注册，因此第一次必须由启用账户级 2FA 的维护者创建。

1. 把包含 `0.1.0-alpha.10` 的发布提交合并到 `main`，创建并推送标签；这一次不要创建 GitHub Release：

   ```sh
   git tag -a v0.1.0-alpha.10 -m "SkillPack One v0.1.0-alpha.10"
   git push origin v0.1.0-alpha.10
   ```

2. 在该标签的干净检出中交互登录，并检查实际包内容：

   ```sh
   npm install --global npm@11.19.1
   npm login
   npm ci --ignore-scripts
   npm run ci
   npm pack --dry-run
   npm publish --access public --tag next
   ```

3. 确认 `https://www.npmjs.com/package/skillpack-one` 中 `0.1.0-alpha.10` 位于 `next`。不要再为这个已发布的首次版本创建 GitHub Release，否则自动流程会按设计拒绝覆盖不可变版本。

## 配置无 Token 发布

1. 在 GitHub 仓库设置中创建名称严格为 `npm` 的 Environment，配置必要审核人，并按需要只允许受保护发布标签部署。
2. 使用 npm 11.19.1 或更高版本、并启用账户级 2FA 后执行：

   ```sh
   npm login
   npm trust github skillpack-one \
     --repo WnagoiYy/skillpack-one \
     --file publish-npm.yml \
     --env npm \
     --allow-publish
   ```

   文件名和 Environment 名称区分大小写，工作流必须已经存在于默认分支。
3. 运行 `npm trust list skillpack-one`，或进入 npm 包设置的 **Trusted publishing** 核对。
4. 第一次自动发布成功后，把 npm **Publishing access** 改为 **Require two-factor authentication and disallow tokens**，并撤销旧写入 Token。
5. 在 GitHub 保护 `v*` 标签，防止未审核提交成为发布候选。

## 日常发布

1. 在经过审核的 PR 中更新 `package.json`、`package-lock.json` 和 `CHANGELOG.md`，绝不复用已发布版本。
2. 合并到 `main` 并等待 CI 通过。
3. 从该 `main` 提交创建严格匹配的 `v<version>` 标签。
4. 为标签发布 GitHub Release。版本包含 SemVer 预发布后缀时必须勾选 prerelease，否则不能勾选。
5. 审批 `npm` Environment 部署。工作流会把预发布版本发布到 `next`，稳定版发布到 `latest`。
6. 验证包和来源证明：

   ```sh
   npm view skillpack-one version dist-tags repository --json
   npm install --global skillpack-one@next
   skillpack --version
   npm audit signatures
   ```

## 失败与回滚

- 如果在 `npm publish` 前失败，修复源码、使用新版本并发布新的 GitHub Release；不要修改已有标签背后的内容。
- npm 版本不可覆盖。错误版本应发布修正版，不能覆盖原版本。
- 通过交互式 2FA 运行 `npm deprecate skillpack-one@<version> "<原因>"` 标记已知问题版本。
- 使用 `npm dist-tag add skillpack-one@<已知良好版本> next` 或 `latest` 恢复分发标签，再发布修正版。
- 除范围明确的紧急安全事件外，不使用 `npm unpublish`；即使撤回，名称与版本组合也不能复用。

未来若希望采用更严格模式，可以把 Trusted Publisher 改为只允许 stage，并把 `npm publish` 替换成 `npm stage publish`。这样公开前还需要一次独立 2FA 审批，但 staged publishing 不能创建全新包。

官方资料：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)、[`npm trust`](https://docs.npmjs.com/cli/v11/commands/npm-trust/)、[npm provenance](https://docs.npmjs.com/generating-provenance-statements/)和 [GitHub 包发布](https://docs.github.com/zh/actions/tutorials/publish-packages/publish-nodejs-packages)。
