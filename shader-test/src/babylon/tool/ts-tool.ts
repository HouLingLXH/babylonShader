export class TsTool {
    //在数组中移除目标（不留空位）
    static arrayRemove(array: any[], remove: any): boolean {
        let index = array.indexOf(remove, 0);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }
        else {
            return false;
        }
    }

    //判断字符串source中是否包含某字符串aim
    static stringContain(source: string, aim: string): boolean {
        let result = source.indexOf(aim) != -1;
        return result;
    }

    //打印调用堆栈
    static trace() {
        console.trace();
    }


}