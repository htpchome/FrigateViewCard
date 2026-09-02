import { CARD_TAG } from "../constants.js";
import { FrigateViewCardEditor } from "./FrigateViewCardEditor.js";

const editorTag = `${CARD_TAG}-editor`;

if (!customElements.get(editorTag)) {
  customElements.define(editorTag, FrigateViewCardEditor);
}
