/**
 * @file Hanoi\js\index.js
 * @desc 汉诺塔问题动画图解
 *
 * @author Mingjie Pi
 * @date 2023-09-27 11:08:15
 */

// 全局变量记录移动次数
let count = 0
// 盘子数
let num = 0
// 定义几个常量
const S = 'SOURCE'
const A = 'AUXILIARY'
const T = 'TARGET'
const time = 3000
// 记录各个柱子上存在的盘子的数量
let numS = 0
let numA = 0
let numT = 0
// 终态数组
const finalState = []

// 获取 style 元素
const styleNode = document.querySelector('style')
// 获取 input 元素
const diskNumNode = document.querySelector('.number')
// 获取 source 元素
const pillarNode = document.querySelector('.source')
// 获取 button 元素
const buttonNode = document.querySelector('.execute')
const resetNode = document.querySelector('.reset')
// 获取移动总次数元素
const totalNode = document.querySelector('.count span')
// 获取 step 元素
const stepNode = document.querySelector('.step')
// 获取输出列表元素
const ulNode = document.querySelector('.step-ul')

const styleSheet = styleNode.sheet

// 盘子容器
const diskList = []
// 准备好 12 种颜色
const colorList = [
  '#EEC900',
  '#FF6A6A',
  '#7CCD7C',
  '#FF00FF',
  '#228B22',
  '#D2691E',
  '#00BFFF',
  '#FFA500',
  '#BEBEBE',
  '#7AC5CD',
  '#4169E1',
  '#8A2BE2'
]

// 失焦判断输入的值是否符合要求，不符合则置空，符合则重新生成对应数量的盘子
diskNumNode.addEventListener('blur', () => {
  if (+diskNumNode.value < 1) {
    diskNumNode.value = '1'
    num = 1
  } else if (+diskNumNode.value > 12) {
    diskNumNode.value = '12'
    num = 12
  } else if (+diskNumNode.value >= 1 || +diskNumNode.value <= 12) {
    // 盘子数
    num = +diskNumNode.value
  } else {
    diskNumNode.value = ''
    alert('请输入盘子个数，范围 1~12')
  }
  diskGenerator(num)
  // 重置柱子上盘子数量
  numS = num
  numA = 0
  numT = 0
})

/**
 * 生成对应数量的盘子
 * @param {number} num 盘子数量
 */
function diskGenerator (num) {
  // 清空 source 下所有子元素
  pillarNode.innerHTML = ''
  // 清空 ulNode 下所有子元素
  ulNode.innerHTML = ''
  // 步数置零
  count = 0

  // 计算所需移动的总步数
  const totalStep = Math.pow(2, num) - 1

  // 将计算结果回显到 span 中
  totalNode.innerText = totalStep

  // 生成对应数量的盘子
  for (let i = 1; i <= num; i++) {
    // 样式
    diskList[i - 1] = document.createElement('div')
    diskList[i - 1].classList.add(`disk-${i}`)
    diskList[i - 1].style.position = 'absolute'
    diskList[i - 1].style.height = '20px'
    diskList[i - 1].style.borderRadius = '50%'
    diskList[i - 1].style.color = '#fff'
    diskList[i - 1].style.fontSize = '12px'
    diskList[i - 1].style.fontWeight = '700'
    diskList[i - 1].style.textAlign = 'center'
    diskList[i - 1].style.lineHeight = '20px'
    diskList[i - 1].style.width = `${10 + 20 * i}px`
    diskList[i - 1].style.left = `${-(4 + 20 * i) / 2}px`
    diskList[i - 1].style.bottom = `${20 * (num - i + 1) - 10}px`
    diskList[i - 1].style.backgroundColor = colorList[i - 1]
    diskList[i - 1].style.transition = 'all 1s'
    diskList[i - 1].style.zIndex = '99'
    diskList[i - 1].innerText = i
    // 初始状态
    finalState[i - 1] = { x: 0, y: 0 }
    // 将生成的元素添加到 source 下
    pillarNode.appendChild(diskList[i - 1])
    }
}

// 监听按钮点击
buttonNode.addEventListener('click', () => {
  if (diskNumNode.value === '') {
    return alert('请输入盘子个数，范围 1~12')
  }
  // 隐藏 开始演示 按钮，显示重置按钮
  buttonNode.style.opacity = '0'
  setTimeout(() => {
    buttonNode.style.display = 'none'
    resetNode.style.display = 'flex'
  }, 1500)
  setTimeout(() => {
    resetNode.style.opacity = '1'
  }, 1600);
  // 禁用输入框
  diskNumNode.disabled = true
  // 重新生成盘子
  diskGenerator(num)
  // 调用 核心算法
  hanoi(num, S, A, T)
})

// 监听重置按钮
resetNode.addEventListener('click', () => {
  // 刷新页面
  location.reload()
})

function moveDiskKeyframes (init, up, trans, down) {
  return `
    @keyframes moveDisk${count} {
      0% {
        transform: ${init};
      }

      35% {
        transform: ${up};
      }

      65% {
        transform: ${trans};
      }

      100% {
        transform: ${down};
      }
    }
  `
}

/**
 * 等待一定时间的异步函数
 * @param {number} ms 毫秒数
 * @returns 返回一个 Promise 对象
 */
function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 移动操作
 * @param {number} n 盘子编号
 * @param {string} from 从哪儿来
 * @param {string} to 到哪儿去
 */
async function move (n, from, to) {
  // 生成 li 并加入 ul 中
  const liNode = document.createElement('li')
  // 将移动信息放入 li 中
  liNode.innerText = `${++count}: Move ${n} from ${from} to ${to}`
  // 将 li 加入到 ul 中
  ulNode.appendChild(liNode)
  stepNode.scrollTop = ulNode.scrollHeight

  // 获取需要移动盘子的终态
  const x = finalState[n - 1].x
  const y = finalState[n - 1].y

  // 获取从哪来的柱子的盘子数量
  let fromNum = 0
  if (from === 'SOURCE') {
    fromNum = numS--
  } else if (from === 'AUXILIARY') {
    fromNum = numA--
  } else if (from === 'TARGET') {
    fromNum = numT--
  }
  // 获取到哪去的柱子的盘子数量
  let toNum = 0
  if (to === 'SOURCE') {
    toNum = numS++
  } else if (to === 'AUXILIARY') {
    toNum = numA++
  } else if (to === 'TARGET') {
    toNum = numT++
  }

  // 判断平移距离
  let moveX = 0
  if ((from === 'SOURCE' && to === 'AUXILIARY') || (from === 'AUXILIARY' && to === 'TARGET')) {
    moveX = 290
  } else if (from === 'SOURCE' && to === 'TARGET') {
    moveX = 580
  } else if ((from === 'AUXILIARY' && to === 'SOURCE') || (from === 'TARGET' && to === 'AUXILIARY')) {
    moveX = -290
  } else if (from === 'TARGET' && to === 'SOURCE') {
    moveX = -580
  }

  // 移动坐标设置
  const upY = y - (310 - 20 * fromNum)
  const downY = upY + (290 - 20 * toNum)

  const init = `translate(${x}px, ${y}px)`
  const up = `translate(${x}px, ${upY}px)`
  const trans = `translate(${x + moveX}px, ${upY}px)`
  const down = `translate(${x + moveX}px, ${downY}px)`

  // console.log(init, up, trans, down)

    // 设置终态
  finalState[n - 1].x = x + moveX
  finalState[n - 1].y = downY
  // 移动规则
  styleSheet.insertRule(moveDiskKeyframes(init, up, trans, down))
  // 开始移动
  diskList[n - 1].style.animation = `moveDisk${count} ${time}ms linear forwards`
  // 等待 3s
  await sleep(time + 500)
}

/**
 * 汉诺塔核心算法
 * @param {number} n 盘子数量
 * @param {string} S 源柱
 * @param {string} A 辅柱
 * @param {string} T 目标柱
 */
async function hanoi (n, S, A, T) {
  if (n === 1) {
    await move(n, S, T)
  } else {
    await hanoi(n - 1, S, T, A)
    await move(n, S, T)
    await hanoi(n - 1, A, S, T)
  }
}
