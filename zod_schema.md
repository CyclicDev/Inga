import { z } from "zod";

// General representation of a single form field
const FieldSchema = z.object({
  fieldName: z.string(), // the label or name of the field
  fieldType: z.enum(["string", "number", "boolean", "date", "enum", "array", "object"]),
  required: z.boolean().optional().default(false),
  enumValues: z.array(z.string()).optional(), // if type is enum
  description: z.string().optional(),
  example: z.any().optional(),
  children: z.array(z.lazy(() => FieldSchema)).optional(), // for nested structures like objects or arrays
});

// General schema for an entire form
const FormSchema = z.object({
  formName: z.string(),
  version: z.string().optional(),
  fields: z.array(FieldSchema),
});
