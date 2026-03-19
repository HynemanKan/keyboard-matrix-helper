export function getDelOne<T>(arrayBefore:T[],arrayAfter:T[]) {
    for (const item of arrayBefore) {
        // 如果修改后的数组中没有当前元素，就是被删除的元素
        if (!arrayAfter.includes(item)) {
            return item;
        }
    }
    return null; // 没有找到被删除的元素时返回null
}
