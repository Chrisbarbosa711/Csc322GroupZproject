# GECToR模型目录

这个目录用于存放预训练的GECToR模型文件。由于模型文件通常很大，不会包含在代码仓库中。

## 模型文件

在生产环境中，您需要下载预训练的GECToR模型。请从原始GECToR仓库或其他官方来源获取以下文件：

- `xlnet_0_gector.th` - 基于XLNet的GECToR模型

## 配置

确保在配置文件中正确设置模型路径：

```python
GECTOR_MODEL_PATH = "app/gector/models/xlnet_0_gector.th"
```

## 注意

- 模拟模式下不需要实际模型文件，系统会使用规则模拟语法错误纠正
- 如需完整功能，请确保下载并放置实际模型文件 