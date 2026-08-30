const DREAMINA_IMAGE_SIZE_FIELD = Object.freeze({
  id: "imageSize",
  type: "segmented",
  placement: "resolution",
  label: "Quality",
  defaultValue: "2K",
  options: Object.freeze([Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
const DREAMINA_SEEDREAM_5_PRO_IMAGE_SIZE_FIELD = Object.freeze({
  id: "imageSize",
  type: "segmented",
  placement: "resolution",
  label: "Quality",
  defaultValue: "1.5K",
  options: Object.freeze([Object.freeze({
    value: "1.5K",
    label: "1.5K"
  }), Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  })])
});
const DREAMINA_IMAGE_UPSCALE_SIZE_FIELD = Object.freeze({
  id: "imageSize",
  type: "segmented",
  placement: "resolution",
  label: "分辨率",
  defaultValue: "2K",
  options: Object.freeze([Object.freeze({
    value: "2K",
    label: "2K"
  }), Object.freeze({
    value: "4K",
    label: "4K"
  }), Object.freeze({
    value: "8K",
    label: "8K"
  })])
});
const DREAMINA_ASPECT_RATIO_FIELD = Object.freeze({
  id: "aspectRatio",
  type: "segmented",
  placement: "resolution",
  label: "Ratio",
  defaultValue: "自适应",
  options: Object.freeze([Object.freeze({
    value: "自适应",
    label: "Auto"
  }), Object.freeze({
    value: "21:9",
    label: "21:9"
  }), Object.freeze({
    value: "16:9",
    label: "16:9"
  }), Object.freeze({
    value: "3:2",
    label: "3:2"
  }), Object.freeze({
    value: "4:3",
    label: "4:3"
  }), Object.freeze({
    value: "1:1",
    label: "1:1"
  }), Object.freeze({
    value: "3:4",
    label: "3:4"
  }), Object.freeze({
    value: "2:3",
    label: "2:3"
  }), Object.freeze({
    value: "9:16",
    label: "9:16"
  })])
});
const DREAMINA_BATCH_SIZE_FIELD = Object.freeze({
  id: "batchSize",
  type: "segmented",
  placement: "batch",
  label: "Batch",
  defaultValue: 1,
  options: Object.freeze([Object.freeze({
    value: 1,
    label: "1x",
    selectedLabel: "1x"
  }), Object.freeze({
    value: 2,
    label: "2x",
    selectedLabel: "2x"
  }), Object.freeze({
    value: 3,
    label: "3x",
    selectedLabel: "3x"
  }), Object.freeze({
    value: 4,
    label: "4x",
    selectedLabel: "4x"
  }), Object.freeze({
    value: 5,
    label: "5x",
    selectedLabel: "5x"
  }), Object.freeze({
    value: 6,
    label: "6x",
    selectedLabel: "6x"
  }), Object.freeze({
    value: 7,
    label: "7x",
    selectedLabel: "7x"
  }), Object.freeze({
    value: 8,
    label: "8x",
    selectedLabel: "8x"
  }), Object.freeze({
    value: 9,
    label: "9x",
    selectedLabel: "9x"
  }), Object.freeze({
    value: 10,
    label: "10x",
    selectedLabel: "10x"
  })])
});
const DREAMINA_IMAGE_MODELS = Object.freeze([Object.freeze({
  modelId: "dreamina/4.0",
  executionId: "dreamina.local-runtime.image-4-0.v1",
  modelVersion: "4.0",
  displayName: "Dreamina 4.0",
  imageMenu: Object.freeze({
    order: 10,
    title: "即梦4.0",
    subtitle: "无图文生图 / 单图图生图"
  })
}), Object.freeze({
  modelId: "dreamina/4.1",
  executionId: "dreamina.local-runtime.image-4-1.v1",
  modelVersion: "4.1",
  displayName: "Dreamina 4.1",
  imageMenu: Object.freeze({
    order: 20,
    title: "即梦4.1",
    subtitle: "细节增强，生成更稳定"
  })
}), Object.freeze({
  modelId: "dreamina/4.5",
  executionId: "dreamina.local-runtime.image-4-5.v1",
  modelVersion: "4.5",
  displayName: "Dreamina 4.5",
  imageMenu: Object.freeze({
    order: 30,
    default: true,
    title: "即梦4.5",
    subtitle: "综合性能均衡，推荐默认"
  })
}), Object.freeze({
  modelId: "dreamina/5.0",
  executionId: "dreamina.local-runtime.image-5-0.v1",
  modelVersion: "5.0",
  displayName: "Dreamina 5.0",
  imageMenu: Object.freeze({
    order: 40,
    title: "即梦5.0",
    subtitle: "新版模型，画面表现更强"
  })
}), Object.freeze({
  modelId: "dreamina/5.0-pro",
  executionId: "dreamina.local-runtime.image-5-0-pro.v1",
  modelVersion: "5.0Pro",
  displayName: "Seedream 5.0 Pro",
  imageSizeField: DREAMINA_SEEDREAM_5_PRO_IMAGE_SIZE_FIELD,
  imageMenu: Object.freeze({
    order: 50,
    title: "Seedream 5.0 Pro",
    subtitle: "支持 1.5K / 2K / 4K，默认 1.5K"
  })
})]);
const DREAMINA_IMAGE_UPSCALE_MODEL = Object.freeze({
  modelId: "dreamina/image-upscale",
  executionId: "dreamina.local-runtime.image-upscale.v1",
  displayName: "图片超清/放大",
  imageMenu: Object.freeze({
    order: 60,
    title: "图片超清/放大",
    subtitle: "上传 1 张图片，选择 2K / 4K / 8K 超清放大"
  })
});
function createDreaminaModelManifest({
  modelId: _0x4800fc,
  executionId: _0x5d6d66,
  displayName: _0x1242a2,
  imageMenu: _0xaa51d6,
  imageSizeField = DREAMINA_IMAGE_SIZE_FIELD
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: _0x4800fc,
    provider: "dreamina",
    kind: "image",
    adapterType: "localRuntime",
    executionId: _0x5d6d66,
    displayName: _0x1242a2,
    icon: "images/jimeng.png",
    extensions: Object.freeze({
      ratioPolicy: Object.freeze({
        capability: "aspectRatio"
      }),
      imageMenu: Object.freeze({
        group: "dreamina",
        ..._0xaa51d6
      })
    }),
    inputSlots: Object.freeze({
      allowedKinds: Object.freeze(["text", "image"]),
      minByKind: Object.freeze({
        image: 0
      }),
      maxByKind: Object.freeze({
        image: 1,
        video: 0,
        audio: 0
      })
    }),
    uiSchema: Object.freeze({
      fields: Object.freeze([imageSizeField, DREAMINA_ASPECT_RATIO_FIELD, DREAMINA_BATCH_SIZE_FIELD])
    }),
    async: true,
    cancellable: true,
    outputType: "image"
  });
}
function createDreaminaImageUpscaleModelManifest() {
  return Object.freeze({
    schemaVersion: "1.0",
    modelId: DREAMINA_IMAGE_UPSCALE_MODEL.modelId,
    provider: "dreamina",
    kind: "image",
    adapterType: "localRuntime",
    executionId: DREAMINA_IMAGE_UPSCALE_MODEL.executionId,
    displayName: DREAMINA_IMAGE_UPSCALE_MODEL.displayName,
    icon: "images/jimeng.png",
    extensions: Object.freeze({
      ratioPolicy: Object.freeze({
        capability: "none"
      }),
      imageMenu: Object.freeze({
        group: "dreamina",
        ...DREAMINA_IMAGE_UPSCALE_MODEL.imageMenu
      })
    }),
    inputSlots: Object.freeze({
      allowedKinds: Object.freeze(["image"]),
      minByKind: Object.freeze({
        image: 1
      }),
      maxByKind: Object.freeze({
        image: 1,
        text: 0,
        video: 0,
        audio: 0
      }),
      fixedSlots: Object.freeze([Object.freeze({
        id: "image",
        kind: "image",
        label: "图片",
        description: "需要放大/超清的原图",
        required: true
      })])
    }),
    uiSchema: Object.freeze({
      fields: Object.freeze([DREAMINA_IMAGE_UPSCALE_SIZE_FIELD])
    }),
    prompt: Object.freeze({
      emptyPolicy: "allowWithInput",
      visible: false
    }),
    async: true,
    cancellable: true,
    outputType: "image"
  });
}
function createDreaminaExecutionManifest({
  executionId: _0x5cb53f,
  modelVersion: _0x4eac92
}) {
  return Object.freeze({
    schemaVersion: "1.0",
    id: _0x5cb53f,
    provider: "dreamina",
    kind: "image",
    adapterType: "localRuntime",
    runtime: "dreaminaImage",
    extensions: Object.freeze({
      dreaminaImage: Object.freeze({
        modelVersion: _0x4eac92
      })
    }),
    result: Object.freeze({
      urlFields: Object.freeze(["url", "imageUrl"])
    })
  });
}
function createDreaminaImageUpscaleExecutionManifest() {
  return Object.freeze({
    schemaVersion: "1.0",
    id: DREAMINA_IMAGE_UPSCALE_MODEL.executionId,
    provider: "dreamina",
    kind: "image",
    adapterType: "localRuntime",
    runtime: "dreaminaImageUpscale",
    result: Object.freeze({
      urlFields: Object.freeze(["url", "imageUrl"])
    })
  });
}
export const dreaminaImageModelManifests = Object.freeze([...DREAMINA_IMAGE_MODELS.map(createDreaminaModelManifest), createDreaminaImageUpscaleModelManifest()]);
export const dreaminaImageExecutionManifests = Object.freeze([...DREAMINA_IMAGE_MODELS.map(createDreaminaExecutionManifest), createDreaminaImageUpscaleExecutionManifest()]);