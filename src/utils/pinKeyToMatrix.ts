
interface ScanMatrixResult {
    x: number[];        // x轴（行）引脚编号
    y: number[];        // y轴（列）引脚编号
    matrix: string[][]; // x*y的扫描矩阵
    missingKey: string[]; // 仅出现在单个引脚的按键
}

/**
 * 从引脚-按键映射+按键-引脚映射，逆向推导键盘扫描矩阵
 * @param keyToPins 按键-引脚映射（键=按键，值=该按键所属的引脚数组）
 * @param reversed 翻转
 * @returns 扫描矩阵结果
 */
export function calculateScanMatrix(
    keyToPins: { [key: string]: number[] },
    reversed:boolean,
): ScanMatrixResult {
    console.log("input",keyToPins);
    const missingKey: string[]=[];
    const twoPinKeys: Map<string,[number,number]> = new Map();
    Object.keys(keyToPins).forEach((key) => {
        //@ts-ignore
        if (keyToPins[key].length !==2){
            missingKey.push(key);
            return;
        }
        //@ts-ignore
        twoPinKeys.set(key,[keyToPins[key][0],keyToPins[key][1]])
    })
    console.log("step1",twoPinKeys,missingKey)
    const pinToPins:Map<number,Set<number>> = new Map();
    twoPinKeys.forEach((key) => {
        if(pinToPins.has(key[0])){
            //@ts-ignore
            pinToPins.get(key[0]).add(key[1])
        }else{
            pinToPins.set(key[0],new Set([key[1]]))
        }
        if(pinToPins.has(key[1])){
            //@ts-ignore
            pinToPins.get(key[1]).add(key[0])
        }else {
            pinToPins.set(key[1],new Set([key[0]]))
        }
    })
    const allPinsIterator = Object.keys(keyToPins).map((key):number[] => {
        //@ts-ignore
        return keyToPins[key].length==2?keyToPins[key]:[]
    });
    const allPinsArray = Array.from(allPinsIterator)
        .flat()
        .filter((pin, index, self) => self.indexOf(pin) === index);
    const sortedPins = allPinsArray.sort((a, b) => a - b);
    const xPins:number[]=[];
    const yPins:number[]=[];
    const pinDone :Set<number> = new Set();
    const fixPin = (nowPin:number,isY:boolean)=>{
        if(pinDone.has(nowPin))return
        pinDone.add(nowPin)
        if(isY){
            if(xPins.includes(nowPin))throw Error(`pins at both side!`)
            yPins.push(nowPin)
        }else{
            if(yPins.includes(nowPin))throw Error(`pins at both side!`)
            xPins.push(nowPin)
        }
        //@ts-ignore
        const ys:Set<number> = pinToPins.get(nowPin)
        ys.forEach(value => fixPin(value,!isY))
    }
    sortedPins.forEach((pin) => {
        fixPin(pin,reversed)
    })
    console.log("x:",xPins,"y:",yPins)

    const matrix: string[][] = Array.from({ length: xPins.length }, () =>
        Array.from({ length: yPins.length }, () => "")
    );

    Object.keys(keyToPins).forEach((key) => {
        //@ts-ignore
        if(keyToPins[key].length!==2)return;
        console.log("location",key,keyToPins[key])
        //@ts-ignore
        const x = Math.max(xPins.indexOf(keyToPins[key][0]), xPins.indexOf(keyToPins[key][1]));
        //@ts-ignore
        const y = Math.max(yPins.indexOf(keyToPins[key][0]), yPins.indexOf(keyToPins[key][1]));
        //@ts-ignore
        matrix[x][y]=key;
    })
    return {
        x:xPins,
        y:yPins,
        matrix,
        missingKey,
    }
}
