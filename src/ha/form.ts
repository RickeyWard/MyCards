/** Subset of the `ha-form` schema types used by card editors. */
export interface HaFormBaseSchema {
  name: string;
  required?: boolean;
  disabled?: boolean;
  context?: Record<string, string>;
}

export interface HaFormSelectorSchema extends HaFormBaseSchema {
  selector: Record<string, unknown>;
}

export interface HaFormGridSchema extends HaFormBaseSchema {
  type: "grid";
  name: "";
  column_min_width?: string;
  schema: readonly HaFormSchema[];
}

export interface HaFormExpandableSchema extends HaFormBaseSchema {
  type: "expandable";
  name: "";
  title?: string;
  icon?: string;
  expanded?: boolean;
  schema: readonly HaFormSchema[];
}

export type HaFormSchema = HaFormSelectorSchema | HaFormGridSchema | HaFormExpandableSchema;
