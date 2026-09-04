import { t } from "../../i18n/index.js";
import { createGenerationErrorCard } from "../generationErrorCard.js";
export function createVideoGenerationErrorCard(_0x32d2be) {
  const _0x1e97eb = t("videoResultRender.generationFailed");
  return createGenerationErrorCard({
    errorMessage: _0x32d2be,
    title: _0x1e97eb
  });
}