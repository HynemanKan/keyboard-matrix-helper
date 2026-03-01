export type KeyItem = {
    label:string,
    width:number,
    height:number,
    itemType:"key"|"space",
}
export type KeyLine = {
    height:number,
    items:KeyItem[],
}
