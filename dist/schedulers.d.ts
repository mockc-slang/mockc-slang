import { Context, Result, Scheduler, Value } from './types';
export declare class PreemptiveScheduler implements Scheduler {
    steps: number;
    constructor(steps: number);
    run(it: IterableIterator<Value>, context: Context): Promise<Result>;
}
