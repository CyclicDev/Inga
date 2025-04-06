import fs from "fs";
import OpenAI from "openai";
import 'dotenv/config';

// Safely handle the potential null value
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY in your environment variables.");
}

// Initialize OpenAI client with API key from .env file
const openai = new OpenAI({ apiKey });

// Path to your local image file
const imagePath = "./lib/form.jpeg";
const base64Image = fs.readFileSync(imagePath, "base64");

(async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Parse this image of a form into structured JSON. Respond only with JSON.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please convert this form to JSON format." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.0,
    });

    // const jsonResponse = JSON.parse(completion.choices[0].message.content as string);
    // console.log(jsonResponse);
    const rawResponse = completion.choices[0].message.content;
    console.log("Raw response:", rawResponse);

    const cleanedResponse = rawResponse ? rawResponse.replace(/```json|```/g, '').trim() : '';

    try {
      const jsonResponse = JSON.parse(cleanedResponse);
      console.log("Parsed JSON response:", jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }


  } catch (error: any) {
    console.error("Error:", error.message);
  }
})();




// // TODO:

// /**
//  * "Interaction loop": repeatedly prompting the model and passing in the user's 
//  * response until the form is complete.
//  */
  

// const RESPONSE_SCHEMA = {
//   type: "json_schema",
//   json_schema: {
//     name: "form_schema",
//     schema: {
//       type: "object",
//       properties: {
//         name: {
//           type: "string",
//           description: "The name of the form"
//         },
//         fields: {
//           type: "array",
//           items: {
//             type: "object",
//             properties: {
//               name: {
//                 type: "string",
//                 description: "The name of the field"
//               },
//               type: {
//                 type: "string",
//                 description: "The type of the field (e.g., text, number, address, phone number, email, date, etc.)"
//               },
//               value: {
//                 type: ["string", "number", "null"],
//                 description: "The user's response for this field"
//               },
//               //  subfields: {
//               // type: "array",
//               // items: {
//               // $ref: "#/properties/fields/items"
//               // }
//             }
//           },
//           required: ["name", "type"],
//           additionalProperties: false
//         }
//       }
//     },
//     required: ["name", "fields"],
//     additionalProperties: false
//   },
//   strict: true
// }

// const getMessages = (formLanguage: string, fields: string): any => {
//   return {
//     "SYSTEM_PROMPT": {
//       role: "system",
//       content: `Task:
//   Guide the user in filling out a multi-field form incrementally.
  
//   Instructions:
//     1.	Incremental Field Prompting:
//     •	Present one form field at a time to the user.
//     •	Wait for the user’s response to the current field before proceeding.
//     2.	Field Response Handling:
//     •	Once the user provides input for a field, update the form with their response.
//     •	Then, move on to the next field in the sequence.
//     3.	Output Format:
//     •	After every user response, return the complete form as a JSON object.
//     •	Include all previously answered fields along with the current field’s value.
//     4.	Completion Indicator:
//     •	When all fields have been filled, include a property "complete": true in the JSON output.
  
//   Example JSON Structure:
  
//   {
// "name": <name of form>,
//  "fields": [{
//           "name": <name of field>,
//            "type": <type of field>,
//            "value": <user's response>
//            },
//          {
//             "name": <name of field>,
//            "type": <type of field>,
//            "value": null
//        }],
//   "complete": false
// }
  
//   Once every field is completed, the final output should resemble:
  
//     {
//       "name": <name of form>,
//       "fields": [{
//             "name": <name of field>,
//             "type": <type of field>,
//             "value": <user's response>
//             },
//           {
//               "name": <name of field>,
//             "type": <type of field>,
//             "value": null
//         }],
//       "complete": true
//     }
  
//     Keep outputs in the form's original language.
    
  
//     ---
  
//     Collect the following fields from the user: ${fields}.
  
//     The form's language is: ${formLanguage || "English"}  # Fallback to English if no language is provided
//   }`
//     },
//     "SPEAK_NEXT": {
//       role: "system",
//       content: `Now, begin by asking the user about the first item in the form and input that item for them if given an appropriate answer based off the description of the item`
//     }
//   }
// };






