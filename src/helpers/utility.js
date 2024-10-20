import cryptojs from 'crypto-js'
import moment from 'moment'
import {
  find,
  join,
  keys,
  map,
  split,
  round,
  isArray,
  isObject,
  indexOf,
  isEmpty,
  range,
} from 'lodash-es'

export const convertThousandSeparator = (number, unit = false, roundPosition = 2) => {
  if (!number && number !== 0) return number
  const convertNumber = unit ? number / unit : number
  let str = split(round(convertNumber, roundPosition), '.')
  str[0] = str[0]
    .toString()
    .replace(/[^0-9]/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (String(convertNumber).indexOf('.') > -1) {
    return convertNumber < 0 ? '-' + join(str, '.') : join(str, '.')
  } else {
    return convertNumber < 0 ? '-' + str[0] : str[0]
  }
}

export const makePhoneNumber = (value) => {
  if (!value) return value
  const currentValue = value.replace(/[^\d]/g, '')
  const cvLength = currentValue.length

  if (cvLength < 4) return currentValue
  if (cvLength < 7) return `${currentValue.slice(0, 3)}-${currentValue.slice(3)}`
  if (cvLength < 10)
    return `${currentValue.slice(0, 2)}-${currentValue.slice(2, 5)}-${currentValue.slice(5, 9)}`
  if (cvLength < 11)
    return `${currentValue.slice(0, 3)}-${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`
  return `${currentValue.slice(0, 3)}-${currentValue.slice(3, 7)}-${currentValue.slice(7, 11)}`
}

export const makeBusinessNumber = (value) => {
  if (!value) return value
  const currentValue = value.replace(/[^\d]/g, '')
  const cvLength = currentValue.length

  if (cvLength < 4) {
    return currentValue
  } else if (cvLength < 7) {
    return `${currentValue.slice(0, 3)}-${currentValue.slice(3)}`
  } else {
    return `${currentValue.slice(0, 3)}-${currentValue.slice(3, 5)}-${currentValue.slice(5, 10)}`
  }
}

export const convertDataForEdit = (initData, header) => {
  const data = {...initData}
  map(header, (title) => {
    switch (title.type) {
      case 'select':
        data[title.key] =
          title.options && title.options.length > 0
            ? find(title.options, {value: initData[title.key]})
            : {value: initData[title.key], name: initData[title.logicKey]}
        break
      case 'date':
        data[title.key] = initData[title.key] ? moment(initData[title.key]).toDate() : null
        break
      default:
        data[title.key] = initData[title.key]
        break
    }
  })

  return data
}

export const validationOneValue = (value, type = null, isRequired) => {
  if (isRequired && type !== 'checkbox' && (!value || value === '')) {
    return {success: false, msg: '값을 입력해주세요.'}
  } else {
    if (value) {
      switch (type) {
        case 'id':
          const idRegExp = /^[a-z0-9!@#\*\.]{2,30}$/
          if (value.length > 30) {
            return {success: false, msg: '30자 이내로 입력해주세요.'}
          } else {
            if (idRegExp.test(value)) {
              return {success: true, value: value}
            } else {
              return {success: false, msg: '특수문자는 .,!,@,#,* 만 사용가능합니다.'}
            }
          }
        case 'number':
          return {
            success: true,
            value: typeof value === 'string' ? Number(value.replace(/,/g, '')) : value,
          }
        case 'password':
          const passwordRegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#\*\.]).{8,}$/
          if (passwordRegExp.test(value)) {
            return {success: true, value: cryptojs.MD5(value.replace(/\s/gi, '')).toString()}
          } else {
            return {
              success: false,
              msg: '영문 대소문자, 특수문자, 숫자를 모두 포함한 8자 이상으로 입력해주세요.',
            }
          }
        case 'select':
          return {success: true, value: value.value || value.value === 0 ? value.value : null}
        case 'multiSelect':
          return {
            success: true,
            value: map(value, (item) => (item.value || item.value === 0 ? item.value : null)),
          }
        case 'phone':
          const convertPhoneNumber = value.indexOf('-') > -1 ? value : makePhoneNumber(value)
          if (/\d{3}-\d{3,4}-\d{4}/g.test(convertPhoneNumber)) {
            return {success: true, value: convertPhoneNumber.replace(/\s/gi, '').replace(/\-/g, '')}
          } else {
            return {success: false, msg: '연락처를 확인해주세요.'}
          }
        case 'businessNumber':
          const convertBusinessNumber = value.indexOf('-') > -1 ? value : makeBusinessNumber(value)
          if (/\d{3}-\d{2}-\d{5}/g.test(convertBusinessNumber)) {
            return {
              success: true,
              value: convertBusinessNumber.replace(/\s/gi, '').replace(/\-/g, ''),
            }
          } else {
            return {success: false, msg: '사업자등록번호를 확인해주세요.'}
          }
        case 'email':
          if (/^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value)) {
            return {success: true, value: value.replace(/\s/gi, '')}
          } else {
            return {success: false, msg: '이메일을 확인해주세요.'}
          }
        case 'space':
          return {success: true, value: value}
        case 'editor':
          return {success: true, value: value}
        case 'checkboxList':
          let hasChecked = false
          const convertedValue = []
          map(value, (chk) => {
            if (chk.checked) {
              hasChecked = true
              convertedValue.push(chk)
            }
          })
          if (hasChecked) {
            return {
              success: true,
              value: convertedValue,
            }
          } else {
            return {success: false, msg: '한가지 이상 선택해주세요.'}
          }
        default:
          return {
            success: true,
            value: typeof value === 'string' ? value.replace(/\s/gi, '') : value,
          }
      }
    } else {
      if (type === 'checkbox') {
        return {success: true, value: Boolean(value)}
      }
      return {success: true, value: value === '' ? undefined : value}
    }
  }
}

export const validation = (
  values,
  validationTypeList,
  isRemoveNull = false,
  duplicateCheck = null,
) => {
  let isAvaliable = true
  const convertValues = {}
  const errors = {}

  map(validationTypeList, async (keyData) => {
    const key = keyData.key
    const validationType = keyData.validationType
    const isRequired = keyData?.isRequired
    const hasDuplicateCheck = keyData?.hasDuplicateCheck
    const result = validationOneValue(values?.[key], validationType || null, isRequired)

    if (result.success) {
      if (hasDuplicateCheck && !duplicateCheck?.[key]) {
        errors[key] = '중복확인을 해주세요.'
        isAvaliable = false
      } else {
        if (isRemoveNull && (!result.value || result.value === '')) {
          convertValues[key] = result.value
        } else {
          convertValues[key] = result.value
        }
      }
    } else {
      errors[key] = result.msg
      isAvaliable = false
    }

    if (keyData?.children) {
      const subkey = keyData.children.key
      const subValidationType = keyData.children.validationType
      const subIsRequired = keyData.children.isRequired
      const subHasDuplicateCheck = keyData?.children.hasDuplicateCheck
      const subResult = validationOneValue(values[subkey], subValidationType || null, subIsRequired)

      if (subResult.success) {
        if (subHasDuplicateCheck && !duplicateCheck?.[subkey]) {
          errors[key] = '중복확인을 해주세요.'
          isAvaliable = false
        } else {
          if (isRemoveNull && (!subResult.value || subResult.value === '')) {
            convertValues[subkey] = subResult.value
          } else {
            convertValues[subkey] = subResult.value
          }
        }
      } else {
        errors[subkey] = subResult.msg
        isAvaliable = false
      }
    }
  })

  if (isAvaliable) {
    return {success: true, data: convertValues}
  } else {
    return {success: false, data: errors}
  }
}

// data : object[]
// transKeyList : 번역되어야하는 값들의 키 리스트
export const transArrayData = (i18next, data, transKeyList = ['name']) => {
  if (isArray(data)) {
    return map(data, (item) => {
      const convertedData = transObjectData(i18next, item, transKeyList)

      return {
        ...item,
        ...convertedData,
      }
    })
  } else {
    return data
  }
}

export const transObjectData = (i18next, data, transKeyList = ['name']) => {
  if (isObject(data)) {
    const convertedData = {...data}
    const dataKeys = keys(data)

    map(dataKeys, (key) => {
      const value = data[key]
      if (isArray(value)) {
        convertedData[key] = transArrayData(i18next, value, transKeyList)
      } else {
        if (indexOf(transKeyList, key) < 0) {
          convertedData[key] = value
        } else {
          convertedData[key] = i18next?.t(value)
        }
      }
    })

    return convertedData
  } else {
    return data
  }
}

/**
 *
 * @param {Object} filterData
 * @param {Object | null} dateKeyData {[기간검색될 데이터키] : {start: [시작 시간 검색키], end: [마지막 시간 검색키]}}
 * @returns
 */
export const convertFilterData = (filterData = null, dateKeyData = null) => {
  if (filterData) {
    const searchTextData = convertSearchTextData(filterData.searchTextData || null)
    const searchDateData = dateKeyData
      ? convertSearchDateData(filterData.dateData || null, dateKeyData)
      : null

    return {
      sortData: filterData.sortData || null,
      searchTextData: searchTextData
        ? {
            ...searchTextData,
            ...(searchDateData && searchDateData),
          }
        : searchDateData,
    }
  } else {
    return {
      sortData: null,
      searchTextData: null,
    }
  }
}

export const convertSearchTextData = (searchTextData = null) => {
  const convertSearchTextData = {}

  if (searchTextData) {
    map(searchTextData, (item) => {
      const isBoolType = item.value === 'true' || item.value === 'false'
      convertSearchTextData[item.key] = isBoolType ? JSON.parse(item.value) : item.value
    })
  }

  return isEmpty(convertSearchTextData) ? null : convertSearchTextData
}

export const convertSearchDateData = (dateData = null, searchKey = null) => {
  const convertSearchDateData = {}

  if (dateData && searchKey) {
    const startKey = searchKey[dateData.key].start || dateData.key
    const endKey = searchKey[dateData.key].end || dateData.key

    convertSearchDateData[startKey] = moment(dateData.value.start).format('YYYYMMDDHHmm')
    convertSearchDateData[endKey] = moment(dateData.value.end).format('YYYYMMDDHHmm')
  }

  return isEmpty(convertSearchDateData) ? null : convertSearchDateData
}

/**
 * defaultLength 는 hour 24, day 30, month 12 이 기본값으로 사용됨으로
 * 31일까지 있는 달의 데이터를 만들때는 defaultLength를 31로 넘겨주어야한다
 * @param {Object[]} data
 * @param {Object} timeData {key : string, type: 'hour' | 'day' | 'month', defaultLength: number}
 * @param {String[]} dataKeys
 */
export const listToGraphData = (data, timeData, dataKeys = []) => {
  const defaultLength = timeData.defaultLength || null

  let timestamp = []
  const result = {
    timestamp,
  }

  map(dataKeys, (key) => {
    result[key] = []
  })

  if (timeData.type === 'daily') {
    map(range(0, 24), (_, index) => {
      result.timestamp.push(`${index + 1}시`)
      map(dataKeys, (dataKey) => {
        result[dataKey].push(null)
      })
    })
  }

  if (timeData.type === 'monthly') {
    map(range(0, defaultLength || 30), (_, index) => {
      result.timestamp.push(`${index + 1}일`)
      map(dataKeys, (dataKey) => {
        result[dataKey].push(null)
      })
    })
  }

  if (timeData.type === 'yearly') {
    map(range(0, 12), (_, index) => {
      result.timestamp.push(`${index + 1}월`)
      map(dataKeys, (dataKey) => {
        result[dataKey].push(null)
      })
    })
  }

  map(data, (item) => {
    map(dataKeys, (dataKey) => {
      // index 값이 필요한 것임으로 -1 해주어야한다
      result[dataKey][item[timeData.key] - 1] = item[dataKey]
    })
  })

  return result
}

export const convertPlanList = (data) => {
  return map(range(0, 24, 1), (time) => {
    const convertTime = time < 10 ? String('0' + time) : String(time)
    const nextTime = Number(time) + 1

    const defaultData = {
      time: convertTime,
      memberUnitPrice: null,
      nonMemberUnitPrice: null,
      envUnitPrice: null,
      roamingUnitPrice: null,
      kepcoUnitPrice: null,
    }
    const findData = find(data, {time: convertTime})
    const timeData = findData || defaultData

    return {
      ...timeData,
      time: convertTime,
      timeLabel: `${convertTime} ~ ${nextTime < 10 ? '0' + nextTime : nextTime}시`,
    }
  })
}

export const convertKepcoPlanList = (kepcoPlanId = null, ssnClsfCd, data, isError = false) => {
  const unitPriceList = map(range(0, 24, 1), (time) => {
    const convertTime = time < 10 ? String('0' + time) : String(time)
    const nextTime = Number(time) + 1

    const defaultData = {
      time: convertTime,
      lowUnitPrice1: isError ? {value: null, state: 'error'} : null,
      lowUnitPrice2: isError ? {value: null, state: 'error'} : null,
      lowUnitPrice3: isError ? {value: null, state: 'error'} : null,
      lowUnitPrice4: isError ? {value: null, state: 'error'} : null,
      highUnitPrice1: isError ? {value: null, state: 'error'} : null,
      highUnitPrice2: isError ? {value: null, state: 'error'} : null,
      highUnitPrice3: isError ? {value: null, state: 'error'} : null,
      highUnitPrice4: isError ? {value: null, state: 'error'} : null,
    }
    const findData = find(data, {time: convertTime})
    const timeData = findData || defaultData

    return {
      ...timeData,
      time: convertTime,
      timeLabel: `${convertTime} ~ ${nextTime < 10 ? '0' + nextTime : nextTime}시`,
    }
  })

  return {
    ...(kepcoPlanId && {kepcoPlanId}),
    ssnClsfCd,
    unitPriceList,
  }
}
