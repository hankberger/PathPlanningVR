import {test} from './main.ts';

export function testReturn(){
    let teststr = test();
    teststr += " And return!";

    return teststr;
}