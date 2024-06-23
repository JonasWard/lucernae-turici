export enum ObjectGenerationOutputStatus {
  default, // means that a default value was used to create the object
  fromType, // means that the object was created from a type entry (non undefined input)
  parsed, // means that the object was created by parsing a string
  errorParsing, // means that the object was created by parsing a string, but an error occurred, so the output data is actually a default one
}
