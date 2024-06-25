export enum ObjectGenerationOutputStatus {
  DEFAULT, // means that a default value was used to create the object
  FROM_TYPE, // means that the object was created from a type entry (non undefined input)
  PARSED, // means that the object was created by parsing a string
  ERROR_PARSING, // means that the object was created by parsing a string, but an error occurred, so the output data is actually a default one
}
