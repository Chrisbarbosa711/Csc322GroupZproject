# GECToR数据目录

这个目录用于存放GECToR模型需要的数据文件，如词汇表等。

## 数据文件

在生产环境中，您需要下载或创建以下数据文件：

- `output_vocabulary` - GECToR使用的词汇表文件

## 配置

确保在配置文件中正确设置数据文件路径：

```python
VOCAB_PATH = "app/gector/data/output_vocabulary"
```

## 注意

- 模拟模式下不需要实际数据文件，系统会使用规则模拟语法错误纠正
- 如需完整功能，请确保下载并放置必要的数据文件 