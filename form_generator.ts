import { parse } from "https://deno.land/std/flags/mod.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable not set");
  Deno.exit(1);
}

// Define a recursive type for form fields
type FormField = {
  name: string;
  type: string;
  subfields?: FormField[];
};

// Define the form schema type
type FormSchema = {
  name: string;
  fields: FormField[];
};

const RESPONSE_FORMAT = {
    type: "json_schema",
    json_schema: {
      name: "form_schema",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the form"
          },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the field"
                },
                type: {
                  type: "string",
                  description: "The type of the field (e.g., text, number, address, phone number, email, etc.)"
                },
                subfields: {
                  type: "array",
                  items: {
                    $ref: "#/properties/fields/items"
                  }
                }
              },
              required: ["name", "type"],
              additionalProperties: false
            }
          }
        },
        required: ["name", "fields"],
        additionalProperties: false
      },
      strict: true
    }
  };


const messages =  [
    {
      role: "system",
      content: "You are a helpful assistant designed to generate structured form schemas based on user input."
    },
    {
      role: "user",
      content: `Create a form schema based on this request: "${prompt}".`
    }
  ]