export interface MockRow {
  text: string;
  align: { x: string };
  padding: number[];
  colSpan: number;
  textColor: string;
}

export interface MockCall {
  method: string;
  args: Argument;
}

type Argument = string[] | number[] | MockRow[];
