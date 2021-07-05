export interface StateProcessor<TInState, TSerializableState = TInState, TOutState = TInState> {
    build(state: TInState): TSerializableState;
    parse(state: unknown): TOutState;
}
