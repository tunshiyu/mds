<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 于效仟
 * @Date: 2021-02-02 09:54:07
 * @LastEditors: 于效仟
 * @LastEditTime: 2022-06-20 11:21:18
-->

## Redash 前端二次开发之地图修改

### 1、 背景：

#### 针对 BI 系统的二次开发，公司选择了 Redash 作为框架。Redash 官方框架的地图使用的是国际地图，它将台湾作为单独存在的个体，这是一个严重的政治问题。所以接到需求，要对地图进行修改。

- 地理分布图修改为**中国地图和各省市地图**
- 地理标记图使用**高德地图**

### 2、 开始开发：

#### 2.1 地理分布图

1、 准备中国地图及各省市地图的 json 数据

这里从别人那里 fork 过来了一个中国省市区县的 geoJSON 格式地图数据,[github 地址](https://github.com/tunshiyu/GeoMapData_CN)。

然后在下面文件为自定义的地图 json 注册。

`client/app/components/visualizations/visualizationComponents.jsx中按照代码修改`

```js
import chinaDataUrl from "@redash/viz/lib/visualizations/choropleth/maps/china.geo.json";
//import ...其他

//省略...

choroplethAvailableMaps: {
       countries: {
         name: "全球国家地图",
         url: countriesDataUrl,
       },
       subdiv_japan: {
         name: "日本行政地图",
         url: subdivJapanDataUrl,
       },
       china: {
         name: "中国地图",
         url: chinaDataUrl,
       },
       shandong: {
         name: "山东省",
         url: shandongDataUrl,
       },
       zhejiang: {
         name: "浙江省",
         url: zhejiangDataUrl,
       },
       anhui: {
         name: "安徽省",
         url: anhuiDataUrl,
       },
       hebei: {
         name: "河北省",
         url: hebeiDataUrl,
       },
     },
```

2、 在名字映射的方法中(如下路径)的 regexMap 中加入中文的正则规则。这里其实放开正则即可，中文这里不需要国外那种字母型的正则校验。

`viz-lib/src/visualizations/choropleth/Editor/utils.js中按照代码修改`

```js
const regexMap = {
  countries: {
    iso_a2: /^[a-z]{2}$/i,
    iso_a3: /^[a-z]{3}$/i,
    iso_n3: /^[0-9]{3}$/i,
  },
  subdiv_japan: {
    name: /^[a-z]+$/i,
    name_local: /^[\u3400-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]+$/i,
    iso_3166_2: /^JP-[0-9]{2}$/i,
  },
  china: {
    name: /.*/,
    name_local: /.*/,
  },
};
```

3、 名字映射规则

`viz-lib/src/visualizations/choropleth/Editor/FormatSettings.jsx中按照代码修改`

在`</ContextHelp>`前面加如下，为了热力图映射

```js
{
  mapType === 'china' ||
    mapType === 'hebei' ||
    mapType === 'shandong' ||
    mapType === 'zhejiang' ||
    (mapType === 'anhui' && (
      <React.Fragment>
        <div>
          <code>{'{{ @@name }}'}</code> 国家简称(英文);
        </div>
        <div>
          <code>{'{{  @@name_local }}'}</code> 国家简称(英文);
        </div>
      </React.Fragment>
    ));
}
```

4、更改下拉

`viz-lib/src/visualizations/choropleth/Editor/GeneralSettings.jsx中按照代码修改`

```js
//我这里只需要中国地图，其他的都删掉了。其实这里的switch没有意义了
switch (options.mapType) {
  // case "countries":
  //   return {
  //     name: "国家简称(英文)",
  //     name_long: "国家全称(英文)",
  //     abbrev: "国家缩写(英文)",
  //     iso_a2: "ISO国家代码(2字母)",
  //     iso_a3: "ISO国家代码(3字母)",
  //     iso_n3: "ISO国家代码(3数字)",
  //   };
  case 'china':
    return {
      name: '中国行政区划名称',
    };
  // case "subdiv_japan":
  //   return {
  //     name: "日本行政区划名称(英文)",
  //     name_local: "日本行政区划名称(日文)",
  //     iso_3166_2: "ISO-3166-2日本行政区划代码",
  //   };
  default:
    return { name: '中国行政区划名称' };
}

//这里加上中国地图，(各省市我加了山东河北浙江安徽，和加中国地图一个操作)
<Section>
  <Select
    label="地图选择"
    data-test="Choropleth.Editor.MapType"
    defaultValue={options.mapType}
    onChange={mapType => handleChangeAndInferType({ mapType })}
  >
    {/* <Select.Option key="countries" data-test="Choropleth.Editor.MapType.Countries">
            全球国家地图
          </Select.Option> */}
    <Select.Option key="china" data-test="Choropleth.Editor.MapType.China">
      中国地图
    </Select.Option>
    <Select.Option
      key="shandong"
      data-test="Choropleth.Editor.MapType.Shandong"
    >
      山东省
    </Select.Option>
    <Select.Option key="hebei" data-test="Choropleth.Editor.MapType.Hebei">
      河北省
    </Select.Option>
    <Select.Option
      key="zhejiang"
      data-test="Choropleth.Editor.MapType.Zhejiang"
    >
      浙江省
    </Select.Option>
    <Select.Option key="anhui" data-test="Choropleth.Editor.MapType.Anhui">
      安徽省
    </Select.Option>
  </Select>
</Section>;
```

5、 更改地图默认配置
`viz-lib/src/visualizations/choropleth/getOptions.js`

```js
  // 地图type默认china,countryCodeType默认为中国行政区划名称
mapType: "china",
countryCodeColumn: "",
countryCodeType: "name",
```

#### 2.2 地理标记图使用高德地图

1、 更改地图瓦片

`viz-lib/src/visualizations/map/initMap.js`

```js
const _tileLayer = L.tileLayer(
  '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
).addTo(_map);
//  使用高德地图瓦片注册
_map.addLayer(
  L.tileLayer(
    'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      subdomains: ['1', '2', '3', '4'],
      minZoom: 1,
      maxZoom: 19,
    },
  ),
);
```

2、 更改默认配置

`viz-lib/src/visualizations/map/getOptions.js的DEFAULT_OPTIONS内修改`

```js
mapTileUrl: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
```
