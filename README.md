# CRAWLER

> 好坏一爬虫

## 安装依赖

```bash
npm install
```

## 抓取任务

### 每日优鲜 missfresh

按指定地区抓取按销量排序的所有品类。

#### 启动

```bash
node missfresh/
```

#### 说明

1. 数据存在相同sku在不同分类下的case

### 天猫 ali

按指定分类抓取按销量排序的所有品类。

#### 启动

```bash
node ali/
```

### 天猫超市 ali/tmsmh5

按销量排序抓取全部品类商品（受阿里防御影响，实际只能抓取分页前4页）。

#### 启动

```bash
# 获取分类信息
node ali/tmsmh5/getCategory
# 开始抓取
node ali/tmsmh5/
```

### 小红书 xiaohongshu

根据给定的关键词，按转发量排序抓取文章，给出文章标题和链接。关键词如下：

```
冰淇淋、雪糕、啤酒、酸奶、小龙虾、汽水、便利蜂、罗森、全家、711、便利店网红
```

#### 启动

```bash
node xiaohongshu/
```

### 瑞幸 luckin

获取瑞幸全部门店信息。

#### 启动

```bash
node luckin/
```

### 联联 lianlian

#### 启动

```bash
node lianlian/
```
