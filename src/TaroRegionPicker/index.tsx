// eslint-disable-next-line no-use-before-define
import React from 'react';
import { View, Text, Picker } from '@tarojs/components';
import './index.less';
import region from './region';

export default class TaroRegionPicker extends React.Component {
  state = {
    region: '请选择省市区',
    // H5、微信小程序、百度小程序、字节跳动小程序
    range: [],
    value: [0, 0, 0],
  };

  // eslint-disable-next-line complexity
  componentWillMount() {
    // 省市区选择器初始化
    // H5、微信小程序、百度小程序、字节跳动小程序
    const range: string[][] = this.state.range;
    let temp = [] as string[];
    for (let i = 0; i < region.length; i++) {
      temp?.push(region[i].name);
    }
    range?.push(temp);
    temp = [];
    for (let i = 0; i < region[0].city.length; i++) {
      temp?.push(region[0].city[i].name);
    }
    range?.push(temp);
    temp = [];
    for (let i = 0; i < region[0].city[0].districtAndCounty.length; i++) {
      temp?.push(region[0].city[0].districtAndCounty[i]);
    }
    range?.push(temp);
    this.setState({
      range: range,
    });
  }

  // H5、微信小程序、百度小程序、字节跳动小程序
  onChange = (e: { detail: { value: number[] } }) => {
    let regionTemp = this.state.region;
    const rangeTemp = this.state.range;
    let valueTemp = this.state.value;

    valueTemp = e.detail.value;
    regionTemp =
      rangeTemp[0][valueTemp[0]] +
      ' - ' +
      rangeTemp[1][valueTemp[1]] +
      ' - ' +
      rangeTemp[2][valueTemp[2]];
    this.setState(
      {
        region: regionTemp,
        range: rangeTemp,
        value: valueTemp,
      },
      () => {
        this.props['onGetRegion'](this.state.value);
      },
    );
  };
  // eslint-disable-next-line complexity
  onColumnChange = (e: { detail: { column: any; value: any } }) => {
    const rangeTemp: string[][] = this.state.range;
    const valueTemp = this.state.value;

    const column = e.detail.column;
    const row = e.detail.value;

    valueTemp[column] = row;

    switch (column) {
      case 0:
        const cityTemp: string[] = [];
        const districtAndCountyTemp: string[] = [];
        for (let i = 0; i < region[row].city.length; i++) {
          cityTemp?.push(region[row].city[i].name);
        }
        for (let i = 0; i < region[row].city[0].districtAndCounty.length; i++) {
          districtAndCountyTemp?.push(region[row].city[0].districtAndCounty[i]);
        }
        valueTemp[1] = 0;
        valueTemp[2] = 0;
        rangeTemp[1] = cityTemp;
        rangeTemp[2] = districtAndCountyTemp;
        break;
      case 1:
        const districtAndCountyTemp2: string[] = [];
        for (
          let i = 0;
          i < region[valueTemp[0]].city[row].districtAndCounty.length;
          i++
        ) {
          districtAndCountyTemp2?.push(
            region[valueTemp[0]].city[row].districtAndCounty[i],
          );
        }
        valueTemp[2] = 0;
        rangeTemp[2] = districtAndCountyTemp2;
        break;
      case 2:
        break;
    }

    this.setState({
      range: rangeTemp,
      value: valueTemp,
    });
  };

  render() {
    return (
      <View>
        {/* 使用多列选择器实现省市区选择器，支持H5、微信小程序、百度小程序、字节跳动小程序 */}

        {/* PS：微信小程序、百度小程序、字节跳动小程序支持设置Picker的属性mode='region'实现省市区选择器，但本组件均采用多列选择器方式实现 */}
        <View
          className={
            this.state.region == '请选择省市区'
              ? 'taro-region-picker taro-region-picker-gray'
              : 'taro-region-picker taro-region-picker-black'
          }
        >
          <Picker
            mode="multiSelector"
            onChange={this.onChange}
            onColumnChange={this.onColumnChange}
            range={this.state.range}
            value={this.state.value}
          >
            <View>
              <Text>{this.state.region}</Text>
            </View>
          </Picker>
        </View>
      </View>
    );
  }
}
