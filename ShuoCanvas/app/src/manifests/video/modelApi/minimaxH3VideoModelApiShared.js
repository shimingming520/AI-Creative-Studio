import { VIDEO_WATERMARK_CN_FIELD, createAspectRatioField, createFooterDurationSliderOptionsField, createResolutionField, createVideoInputSlots } from "./vendorVideoModelApiShared.js";
export const MINIMAX_H3_RESOLUTION_FIELD = createResolutionField({
  label: "视频分辨率",
  defaultValue: "2K",
  options: ["768P", "2K"]
});
export const MINIMAX_H3_RATIO_FIELD = createAspectRatioField({
  label: "宽高比",
  defaultValue: "16:9",
  options: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"]
});
export const MINIMAX_H3_DURATION_FIELD = createFooterDurationSliderOptionsField({
  values: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  defaultValue: 5
});
export const MINIMAX_H3_WATERMARK_FIELD = VIDEO_WATERMARK_CN_FIELD;
export const MINIMAX_H3_FRAMES_PROMPT_PLACEHOLDER = "不传图片时生成文生视频；传一张图片时描述画面如何运动；传首尾两帧时描述过渡过程。";
export const MINIMAX_H3_REFERENCE_PROMPT_PLACEHOLDER = "结合参考图片、视频或音频，描述主体、动作、声音和镜头关系。";
export const MINIMAX_H3_HELP_TOOLTIP = Object.freeze(["MiniMax-H3（Hailuo-03），支持 768P / 2K 和 4-15 秒。", "首尾帧模式：无图片自动文生视频；一张图片自动图生视频；两张图片作为首尾帧。", "多参考模式：最多支持 9 张图片、3 个视频和 3 个音频。"]);
export const MINIMAX_H3_MEDIA_CONSTRAINTS = Object.freeze({
  image: Object.freeze({
    maxBytes: 31457280,
    allowedExtensions: Object.freeze(["jpg", "jpeg", "png", "webp", "heic", "heif"])
  }),
  video: Object.freeze({
    minDurationSeconds: 2,
    maxDurationSeconds: 15,
    maxBytes: 52428800,
    allowedExtensions: Object.freeze(["mp4", "mov"])
  }),
  audio: Object.freeze({
    minDurationSeconds: 2,
    maxDurationSeconds: 15,
    maxBytes: 15728640,
    allowedExtensions: Object.freeze(["mp3", "wav"])
  })
});
export function createMinimaxH3ModeField(_0x4d858a) {
  return Object.freeze({
    id: _0x4d858a,
    type: "segmented",
    placement: "mode",
    variant: "sectionMenu",
    label: "模式选择",
    defaultValue: "frames",
    options: Object.freeze([Object.freeze({
      value: "frames",
      label: "首尾帧"
    }), Object.freeze({
      value: "reference",
      label: "多参考"
    })])
  });
}
export function createMinimaxH3VideoInputSurface(_0x3d8d3b) {
  return Object.freeze({
    hideFixedInputSlotsWhen: Object.freeze({
      field: _0x3d8d3b,
      value: "reference"
    })
  });
}
function createMinimaxH3FixedSlot({
  id: _0x4396f4,
  kind: _0x1bed57,
  label: _0x420b4c,
  mode: _0x2e64eb,
  description: _0x5046ed,
  displayOrder: _0x370bfd,
  modeFieldId: _0x3273db
}) {
  return Object.freeze({
    id: _0x4396f4,
    kind: _0x1bed57,
    label: _0x420b4c,
    description: _0x5046ed,
    displayOrder: _0x370bfd,
    showWhen: Object.freeze({
      field: _0x3273db,
      value: _0x2e64eb
    })
  });
}
export function createMinimaxH3InputSlots(_0x269c68) {
  const _0x5118ae = Object.freeze([createMinimaxH3FixedSlot({
    id: "firstFrame",
    kind: "image",
    label: "首帧",
    mode: "frames",
    description: "可选；不传图片时自动使用文生视频",
    displayOrder: 10,
    modeFieldId: _0x269c68
  }), createMinimaxH3FixedSlot({
    id: "lastFrame",
    kind: "image",
    label: "尾帧",
    mode: "frames",
    description: "可选；与首帧配合生成首尾帧过渡",
    displayOrder: 20,
    modeFieldId: _0x269c68
  }), createMinimaxH3FixedSlot({
    id: "referenceImage",
    kind: "image",
    label: "参考图",
    mode: "reference",
    description: "多参考模式最多支持 9 张图片",
    displayOrder: 30,
    modeFieldId: _0x269c68
  }), createMinimaxH3FixedSlot({
    id: "referenceVideo",
    kind: "video",
    label: "参考视频",
    mode: "reference",
    description: "多参考模式最多支持 3 个视频",
    displayOrder: 40,
    modeFieldId: _0x269c68
  }), createMinimaxH3FixedSlot({
    id: "referenceAudio",
    kind: "audio",
    label: "参考音频",
    mode: "reference",
    description: "多参考模式最多支持 3 个音频",
    displayOrder: 50,
    modeFieldId: _0x269c68
  })]);
  const _0x4b918b = Object.freeze([Object.freeze({
    when: Object.freeze({
      field: _0x269c68,
      value: "frames"
    }),
    allowedKinds: Object.freeze(["text", "image"]),
    maxByKind: Object.freeze({
      image: 2,
      video: 0,
      audio: 0
    })
  })]);
  return createVideoInputSlots({
    image: 9,
    video: 3,
    audio: 3,
    fixedSlots: _0x5118ae,
    cycleFixedInputWhenFull: true,
    preserveHiddenInputsByKind: true,
    policyVariants: _0x4b918b,
    maxTotalDurationSecondsByKind: Object.freeze({
      video: 15,
      audio: 15
    }),
    mediaConstraintsByKind: MINIMAX_H3_MEDIA_CONSTRAINTS
  });
}
export function createMinimaxH3Fields(_0x3ca8dc) {
  return Object.freeze([createMinimaxH3ModeField(_0x3ca8dc), MINIMAX_H3_RESOLUTION_FIELD, MINIMAX_H3_RATIO_FIELD, MINIMAX_H3_DURATION_FIELD, MINIMAX_H3_WATERMARK_FIELD]);
}
export function createMinimaxH3Prompt(_0x56e129) {
  return Object.freeze({
    placeholder: MINIMAX_H3_FRAMES_PROMPT_PLACEHOLDER,
    variants: Object.freeze([Object.freeze({
      when: Object.freeze({
        field: _0x56e129,
        value: "frames"
      }),
      placeholder: MINIMAX_H3_FRAMES_PROMPT_PLACEHOLDER
    }), Object.freeze({
      when: Object.freeze({
        field: _0x56e129,
        value: "reference"
      }),
      placeholder: MINIMAX_H3_REFERENCE_PROMPT_PLACEHOLDER
    })])
  });
}