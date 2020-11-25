/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-use-before-define
import React, { Component } from 'react';
import { View, Text, Picker } from '@tarojs/components';
import resdata from './data';

class RegionPicker extends Component<{
  onChange: (p: { province: string; city: string; country: string }) => void;
  value: { province: string; city: string; country: string };
}> {
  constructor(props: any) {
    super(props);
    this.state = {
      addressData: [],
      rangeKey: [0, 0, 0],
      rangeData: [[], [], []],
      formData: {
        province: '',
        city: '',
        country: '',
      },
    };
  }

  UNSAFE_componentWillReceiveProps() {
    this.getAddress();
  }

  getAddress = () => {
    const addressData = resdata;
    this.setState(
      {
        addressData: addressData,
      },
      () => {
        const { value } = this.props as any;
        if (!value.province) {
          this.handleCityData([0, 0, 0]);
        } else {
          this.getRangeKey(value);
        }
      },
    );
  };
  // eslint-disable-next-line complexity
  getRangeKey = (data: { province: string; city: string; country: string }) => {
    // 详情的时候获取对应的展示位置
    const { addressData } = this.state as any;
    const provinceObj = resdata.find(
      item => data.province === item.provinceCode,
    );

    const cityObj = provinceObj?.cities.find(
      item => data.city === item.cityCode,
    );

    const countryObj = cityObj?.countries.find(
      item => data.country === item.countryCode,
    );

    const getAddress = {
      province: provinceObj?.provinceName,
      city: cityObj?.cityName,
      country: countryObj?.countryName,
    };
    this.setState({
      formData: getAddress,
    });
    let provinceIndex = 0;
    let cityIndex = 0;
    let countryIndex = 0;
    for (let i = 0; i < addressData.length; i++) {
      const province = addressData[i];
      if (province.provinceName === getAddress.province) {
        provinceIndex = i;
        for (let j = 0; j < province.cities.length; j++) {
          const city = province.cities[j];
          if (city.cityName === getAddress.city) {
            cityIndex = j;
            for (let k = 0; k < city.countries.length; k++) {
              const country = city.countries[k];
              if (country.countryName === getAddress.country) {
                countryIndex = k;
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }
    const rangeKey: number[] = [];
    rangeKey.push(provinceIndex);
    rangeKey.push(cityIndex);
    rangeKey.push(countryIndex);
    this.handleCityData(rangeKey);
    this.setState({
      rangeKey: rangeKey,
    });
  };
  handleCityData = (key: (string | number)[]) => {
    // 处理数据
    const provinceList: string[] = []; // 省
    const cityList: string[] = []; // 市
    const areaList: string[] = []; // 区
    const { addressData } = this.state as any;
    for (let i = 0; i < addressData.length; i++) {
      // 获取省
      const province = addressData[i];
      provinceList.push(province.provinceName);
    }
    if (addressData[key[0]].cities && addressData[key[0]].cities.length > 0) {
      for (let i = 0; i < addressData[key[0]].cities.length; i++) {
        // 获取对应省下面的市
        const city = addressData[key[0]].cities[i];
        cityList.push(city.cityName);
      }
    }
    for (
      let i = 0;
      i < addressData[key[0]].cities[key[1]].countries.length;
      i++
    ) {
      // 获取市下面对应区
      const country = addressData[key[0]].cities[key[1]].countries[i];
      areaList.push(country.countryName);
    }
    // }
    const newRange: string[][] = [];
    newRange.push(provinceList);
    newRange.push(cityList);
    newRange.push(areaList);
    this.setState({
      rangeData: newRange,
      rangeKey: key,
    });
  };
  onChange = (e: { detail: { value: any } }) => {
    const { value } = e.detail;
    this.getAddressName(value);
  };
  getAddressName = (value: (string | number)[]) => {
    // 这里是转化用户选择的地址数据
    const { addressData } = this.state as any;
    const formData = {
      province: '',
      city: '',
      country: '',
    };
    const payload = {
      province: '',
      city: '',
      country: '',
    };
    if (addressData[value[0]]) {
      formData.province = addressData[value[0]].provinceName; // 省名称
      payload.province = addressData[value[0]].provinceCode; // 省code
      if (
        addressData[value[0]].cities &&
        addressData[value[0]].cities[value[1]]
      ) {
        formData.city = addressData[value[0]].cities[value[1]].cityName;
        payload.city = addressData[value[0]].cities[value[1]].cityCode;
        if (
          addressData[value[0]].cities[value[1]].countries &&
          addressData[value[0]].cities[value[1]].countries[value[2]]
        ) {
          formData.country =
            addressData[value[0]].cities[value[1]].countries[
              value[2]
            ].countryName;
          payload.country =
            addressData[value[0]].cities[value[1]].countries[
              value[2]
            ].countryCode;
        }
      }
    }
    this.setState({
      formData: formData,
    });
    this.props.onChange(payload);
  };
  onColumnChange = (e: { detail: any }) => {
    const { rangeKey } = this.state as any;
    const changeColumn = e.detail;
    const { column, value } = changeColumn;
    switch (column) {
      case 0:
        this.handleCityData([value, 0, 0]);
        break;
      case 1:
        this.handleCityData([rangeKey[0], value, 0]);
        break;
      case 2:
        this.handleCityData([rangeKey[0], rangeKey[1], value]);
        break;
    }
  };
  render() {
    const { formData, rangeData, rangeKey } = this.state as any;
    return (
      <View className="change-city">
        <View>
          <Picker
            mode="multiSelector"
            onChange={this.onChange}
            onColumnChange={this.onColumnChange}
            range={rangeData}
            value={rangeKey}
          >
            <View className="picker">
              <Text className="label">所在地址：</Text>
              {formData.province && (
                <Text>
                  {formData.province}
                  {formData.city}
                  {formData.country}
                </Text>
              )}
              {!formData.province && (
                <Text className="placeholder">请选择省/市/区</Text>
              )}
            </View>
          </Picker>
        </View>
      </View>
    );
  }
}
export default RegionPicker;
