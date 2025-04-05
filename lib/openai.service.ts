import { parse } from "https://deno.land/std/flags/mod.ts";

// Check if OpenAI key exists:
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

const RESPONSE_SCHEMA = {
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
                description: "The type of the field (e.g., text, number, address, phone number, email, date, etc.)"
              },
              value: {
                type: ["string", "number", "null"],
                description: "The user's response for this field"
              },
              //  subfields: {
              // type: "array",
              // items: {
              // $ref: "#/properties/fields/items"
              // }
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

const getMessages = (formLanguage: string, fields: string): any => {
  return {
    "SYSTEM_PROMPT": {
      role: "system",
      content: `Task:
  Guide the user in filling out a multi-field form incrementally.
  
  Instructions:
    1.	Incremental Field Prompting:
    •	Present one form field at a time to the user.
    •	Wait for the user’s response to the current field before proceeding.
    2.	Field Response Handling:
    •	Once the user provides input for a field, update the form with their response.
    •	Then, move on to the next field in the sequence.
    3.	Output Format:
    •	After every user response, return the complete form as a JSON object.
    •	Include all previously answered fields along with the current field’s value.
    4.	Completion Indicator:
    •	When all fields have been filled, include a property "complete": true in the JSON output.
  
  Example JSON Structure:
  
  {
"name": <name of form>,
 "fields": [{
          "name": <name of field>,
           "type": <type of field>,
           "value": <user's response>
           },
         {
            "name": <name of field>,
           "type": <type of field>,
           "value": null
       }],
  "complete": false
}
  
  Once every field is completed, the final output should resemble:
  
    {
      "name": <name of form>,
      "fields": [{
            "name": <name of field>,
            "type": <type of field>,
            "value": <user's response>
            },
          {
              "name": <name of field>,
            "type": <type of field>,
            "value": null
        }],
      "complete": true
    }
  
    Keep outputs in the form's original language.
    
  
    ---
  
    Collect the following fields from the user: ${fields}.
  
    The form's language is: ${formLanguage || "English"}  # Fallback to English if no language is provided
  }`
    },
    "SPEAK_NEXT": {
      role: "system",
      content: `Now, begin by asking the user about the first item in the form and input that item for them if given an appropriate answer based off the description of the item`
    }
  }
};






