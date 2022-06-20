<!--
 * @文件描述:
 * @公司: thundersdata
 * @作者: 于效仟
 * @Date: 2022-05-18 10:27:43
 * @LastEditors: 于效仟
 * @LastEditTime: 2022-05-18 10:27:43
-->

一、背景

最近在做客户中心化项目，包含了客户池、客户呼叫、下派、档案管理及服务回流等操作。所以抽取了一套可配置的客户中心化业务模板作为子服务，服务于各业务的客户中心化。
项目中使用 formily 作为表单解决方案，由于业务在爆发阶段，所以产生了很多常见和特殊的表单场景。通过此次实践，总结了一些使用 formily 时得心应手的表单场景和一些用起来会带来麻烦的场景。formily 版本为 1.x。

二、业务场景及解法

1、不同业务线的列表页封装(方案/传参/时间处理)

描述： 这里我们只关心从 json 到渲染出搜索列表的过程，而暂时不会关心怎么配置出 json。一个 pro code 列表页基于现在业界的方案已经很成熟，比如 ProTable、团队内的 FormRender 以及本项目用的 useTableQuery.这里使用 useTableQuery 主要原因是测试一下通用的表单方案 formily 在 iHome 的各种业务下是否也能覆盖。
首先是基础逻辑，查询列表拆分成两块东西：查询/列表。列表就是用户列表，查询就是根据性别/是否是会员/用户服务状态/下派时间等等进行筛选。
这里分几个方面进行分解：

● 渲染查询表单和列表的函数

解法： 下面是一个渲染查询表达的函数。入参是 IMarkupSchemaFieldProps 和 enumType，分别是 formily 的 Field 组件的 props 和用于枚举的 enumType，enumType 通过 useDim hooks 拿到 options 给组件使用。自定义组件也是使用" x-component"字段，当字段 map 到 customMap 中的自定义组件的 name 时，返回自定义组件，否则把全部 props 塞到。

// IMarkupSchemaFieldProps 是 formily 的 Field 组件的所有 props
type FilterProp = IMarkupSchemaFieldProps & { enumType: MetaType };

/\*\*

- 根据 filterConfig 获取 Field
- @param filterConfig formItemProps
- @returns 返回<field />
  \*/
  const getFilter = useCallback(
  ({ enumType, ...filterConfig }: FilterProp) => {
  const customMap = {
  activityIdFilterComp: <ActivityIdComp {...filterConfig} />,
  ServiceTagTreeSelect: <Field type="string" x-component="ServiceTagTreeSelect" {...filterConfig} />,
  EmployeeSearch: <Field type="string" x-component="EmployeeSearch" {...filterConfig} />,
  Address: (
  <Field
  type="string"
  name="address"
  x-component="Address"
  {...filterConfig}
  x-component-props={{ needDetail: false, maxTab: 3, placeholder: '请输入' }}
  />
  ),
  DistributeStoreSelectComp: <Field type="string" x-component="DistributeStoreSelectComp" {...filterConfig} />,
  BaseFormItem: (
  <Field
  type="string"
  x-component="Input"
  {...filterConfig}
  enum={enumType ? getDim(enumType) : filterConfig.enum}
  />
  ),
  };

        return customMap[filterConfig['x-component'] as keyof typeof customMap] || customMap.BaseFormItem;
      },
      [getDim]

  );

下面是渲染列表每一项的函数。入参为 IColumnConfig。这里面大多数都是 AntdTable column 的 prop，有两个自定义字段。renderComp 字段会根据值去 map 到 columnMap 里的自定义组件，formatType 会到 getDataFormatMap 函数内，会有几种简单的自定义渲染格式类型，比如时间类型，这种的渲染无需开发一个新的组件，所以用这种指定格式化类型的方式去修改简便一些。

interface IColumnConfig {
title: string;
dataIndex: string;
enumType: MetaType;
renderComp: string;
render?: any;
formatType: string;
}
/\*\*

- 根据配置渲染列表
- @param columnConfig
- @returns 一个对象{title,dataIndex,enum,render,...restColumnProps}
  \*/
  const getColumn = useCallback(
  (columnConfig: IColumnConfig) => {
  const {
  title,
  dataIndex,
  enumType,
  renderComp,
  render,
  formatType = 'default',
  ...restColumnProps
  } = columnConfig;

      /**
       * 格式value
       * @param value
       * @returns
       */
      const getDataFormatMap = (value: any) => {
        return {
          time: value ? moment(Number(value)).format('YYYY-MM-DD HH:mm:ss') : '-',
          default: enumType
            ? getDim(enumType || '')?.find((i: { value: moment.MomentInput }) => i.value === value)?.label
            : value,
        };
      };

      const columnMap = (columnProps: IColumnProps) => ({
        centerServiceStateColumnComp: <ServiceStateSelect {...columnProps} />,
        dispatchStatusColumnComp: <DispatchStatusColumnComp {...columnProps} />,
        // 智造
        DistributeColumnComp: <DistributeColumnComp {...(columnProps as IColumnProps<IService>)} />,
        ServiceIdColumnComp: <ServiceIdColumnComp {...(columnProps as IColumnProps<IService>)} />,
        FlowsColumnComp: <FlowsColumnComp {...(columnProps as IColumnProps<IService>)} />,
        ServiceTagsColumnComp: <ServiceTagsColumnComp {...(columnProps as IColumnProps<IService>)} />,
      });

      /**
       * 返回渲染
       * @param columnProps
       * @returns
       */
      const getRender = (columnProps: IColumnProps) => {
        if (renderComp) {
          return columnMap(columnProps)[renderComp as keyof typeof columnMap] || '';
        }
        return getDataFormatMap(columnProps.value)[formatType as keyof typeof columnMap];
      };
      return {
        title,
        dataIndex,
        enum: getDim(enumType || ''),
        render: (value: string, record: Customer | IService) =>
          render
            ? render(record)
            : getRender({
                value,
                record,
                opntions: getDim(enumType) || [],
                tableTrigger,
              }),
        ...restColumnProps,
      };

  },
  [getDim, tableTrigger]
  );

● 具有字典特性的查询表单和列表展示

解法： 筛选表和列表都是利用了一个后端提供的字典接口，前端封装成一个自定义 hooks。

● 筛选项里有时间，有的是月，有的是日，这种表单组件可以配出来，但是数据如何加工？

解法： 在 useFormTableQuery 的 service 函数内，通过传进来的筛选项的 Json 去查找字段 type === 'array'。然后转换成时间戳格式，与后端预定好时间的传参都使用时间戳格式。

● useFormTableQuery 第二个参数传的函数在执行时无法拿到外部的 state

解法： 这里说的是 useFormTableQuery 的 service 内拿不到组件作用域的 state。可以通过 ref 绑定的形式在 service 函数内拿到外部作用域的状态。

2、编辑及详情使用同一个 form

描述： 我们开发表单的常用思路是，新增和编辑可以通过同一个 form 去封装，通过 id 去判断是否是详情并进行表单回填。但是详情一般是我们单独写了一份代码。
解法： formily 为 SchemaForm 组件提供了一个 editable。当 editable 为 false 的时候就是详情的状态，并且一些 formily 的表单组件做了详情态的优化。这个功能有时候会很方便，不需要自己去写一个 rowcol。并且即使详情有一些和表单长得不一样的，我们仍然可通过判断是否是详情来控制在详情表单的差异。

3、嵌套 form

描述：本来只有 A 表单，服务端提供一个接口进行提交。随着业务的扩展，A 表单越来越庞大，拆成了 B 和 C，服务端也对接口进行了修改，分成两个接口。
解法： 传统的做法要么是表单不动，请求层进行 format，要么是写个自定义表单组件套在原来的表单外面。
formily 提供了 type='object'的属性来控制 form 嵌套。

 <Field type="object" name="demandContent">
  // ...<Field />  
 </Field>

4、x 单位 x 单位 x 单位 类型表单

描述：

解法：

<FormTextBox name="houseLayout" title="房屋户型" text="%s室 %s厅 %s厨 %s卫">
                  <Field type="number" default={1} name="room" x-component="NumberPicker" />
                  <Field type="number" default={1} name="hall" x-component="NumberPicker" />
                  <Field type="number" default={1} name="kitchen" x-component="NumberPicker" />
                  <Field type="number" default={1} name="washroom" x-component="NumberPicker" />
 </FormTextBox>

5、后面带单位的

描述： 常规做法还是自己写自定义组件。

<Field
type="number"
title="房屋预算"
name="totalBudget"
x-component="NumberPicker"
x-mega-props={{
              addonAfter: '元',
            }}
/>

6、自定义组件

formily 的自定义组件和常用的表单自定义组件完全一样。只是需要注册到 schemaForm 组件的 components 内。

7、grid 布局

布局的原理和方法与 antd 的 grid 布局是一样的，用起来还是比较灵活的，不过需要注意 formliy 的 Field 使用 row col 无效。最简单好用的就是依次排列的，比如两列排下去。如下：

      <FormMegaLayout full grid autoRow columns={2} labelWidth={100} wrapperWidth={500}>

如果某个字段需要单独占一列。只需要对该字段的 field 指定布局如下：

<Field
type="string"
title="服务类型"
name="demandType"
required
x-mega-props={{ span: 2 }}
/>

三、 一些遇到的问题

1、目前的分页器太简单，而且有一些自然行为比如在第二页点击查询去第一页是没有默认做进去的。
2、 部分 antd 组件能放进去
部分指定了 value 和 onchang 的组件放进去会直接报错。

四、 思考

在当前业务下，formily 确确实实 cover 住了各种表单场景，并且有一些场景是有提效的。不过在找不同的场景对应的 API 和最佳实践也消耗了很大的功夫。并且在从官方文档找某个问题的时候，第一次使用的人很难从那么多的文档和从字意难以推测的标题中找到自己想看的，后面使用的多了倒是大致能记住某个方面的东西在哪一片文字里。就像官方文档写的，formily 是有学习成本的，要学就需要要学习一整套然后实践。所以这个东西到底好不好用是见仁见智，不过值得说的是它确实能用，并且花点时间可以用的很好。
