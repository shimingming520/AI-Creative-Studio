import { deletePromptPresetFromServer, fetchPromptPresetsFromServer, savePromptPresetToServer } from "../../api/promptPresetsApi.js";
import { PROMPT_PRESET_TEMPLATE_TYPE_CONDITIONAL_BY_IMAGE_INPUT, PROMPT_PRESET_TEMPLATE_TYPE_STATIC, PROMPT_PRESET_USER_INPUT_PLACEHOLDER } from "./promptPresetTemplate.js";
import { resolvePresetDefaultCoverDataUrl } from "./presetCoverResolver.js";
import a1174_0x20178c from "../core/stores/appStore.js";
import { t } from "../i18n/index.js";
function promptPresetsText(_0x5a5e8b, _0x1f34c1 = {}) {
  return t("promptPresets." + _0x5a5e8b, _0x1f34c1);
}
function optionalPromptPresetsText(_0x277755, _0x1105ba = {}) {
  const _0x3bfbdc = "promptPresets." + _0x277755;
  const _0x2ef201 = t(_0x3bfbdc, _0x1105ba);
  if (_0x2ef201 === _0x3bfbdc) {
    return "";
  } else {
    return _0x2ef201;
  }
}
export const PROMPT_PRESET_TRIGGER_MODE_DIRECT = "direct";
export const PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT = "insertPrompt";
const PROMPT_PRESET_TRIGGER_MODES = new Set([PROMPT_PRESET_TRIGGER_MODE_DIRECT, PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT]);
export const REVERSE_IMAGE_PROMPT_PRESET_TITLE = "反推图片提示词";
export const REVERSE_IMAGE_PROMPT_PRESET_PROMPT = "你是一名专业 AI 图像提示词反推工程师。\n\n我将上传一张图片，请你根据图片内容，反推出一段可以用于 AI 生图模型生成同款图片的提示词。\n\n要求：\n1. 不要只是普通描述图片，而是要写成“可直接用于 AI 生图”的提示词。\n2. 请完整分析画面中的：主体、人物数量、性别年龄、外貌特征、服装、发型、动作、姿态、表情、视线方向、手部动作。\n3. 请分析景别与构图：特写/近景/中景/全身/远景，正面/侧面/背影，俯拍/仰拍/平视，人物在画面中的位置，背景虚化程度。\n4. 请分析环境：室内/室外、地点、时间、天气、背景元素、前景/中景/远景。\n5. 请分析光线：自然光/棚拍光/逆光/侧光/柔光/硬光、光源方向、阴影、高光。\n6. 请分析色彩与氛围：主色调、冷暖、饱和度、对比度、情绪氛围。\n7. 请分析风格：真实摄影、电影感、杂志大片、日系写真、商业广告、动漫、3D、油画等。\n8. 请分析镜头语言：镜头焦段、景深、画质、胶片感、颗粒感、清晰度。\n9. 如果图片中有无法确定的信息，请根据画面合理推断，但不要编造明显不存在的元素。\n10. 最终请输出一段完整的中文提示词、一段英文提示词，以及一段反向提示词。\n\n\n输出格式如下：\n\n【画面拆解】\n主体：\n景别与构图：\n人物动作：\n表情与视线：\n服装与造型：\n场景环境：\n光线：\n色彩氛围：\n风格：\n镜头与画质：\n\n【中文完整提示词】\n把上面的信息整合成一段流畅、专业、可直接用于 AI 生图的中文提示词。\n\n【English Prompt】\nTranslate and optimize the prompt into natural English for AI image generation.\n\n【反向提示词】\n输出用于避免低质量、畸变、错误细节、文字水印等问题的中文反向提示词。";
export const MINIMAX_H3_FULL_CHARACTER_REPLACEMENT_PROMPT = "将 <Video 1> 中的主要人物完整替换为 <Picture 1> 中的人物，包括人物身份、面部、发型、身体特征、服装和配饰。\n\n新人物完整采用 <Picture 1> 的外貌与穿搭，但严格继承 <Video 1> 中原人物的动作、姿势、表演、走位、视线、表情、口型和动作时间。\n\n语音沿用 <Video 1> 原始音轨，不重新生成或修改。新人物的表情和口型逐帧匹配原人物并与原语音同步；不说话时自然闭口。\n\n完整保留原视频的镜头运动、构图、背景、场景、道具、环境光线、阴影、遮挡关系和剪辑节奏。服装在快速动作、转身和遮挡时保持结构稳定，人物面部在所有角度保持一致。\n\n忽略 <Picture 1> 的背景、姿势、光线和相机角度，不要将参考图背景带入视频。";
export const MINIMAX_H3_GENERAL_CHARACTER_REPLACEMENT_PROMPT = "以 <Video 1> 为基础进行人物替换。\n\n将视频中的主要人物完整替换为 <Picture 1> 中的人物。准确保留 <Picture 1> 中人物的面部身份、五官比例、脸型、发型、发色、肤色、年龄特征和身体比例。\n\n严格继承 <Video 1> 中原人物的全部动作、姿势、走位、头部转动、视线、表情变化、口型变化和动作节奏。保持原视频的镜头角度、景别、运镜、构图、场景、背景、光线、阴影、道具、遮挡关系和时间节奏不变。\n\n语音沿用 <Video 1> 原始音轨，不重新生成或修改。新人物的表情和口型逐帧匹配原人物并与原语音同步；不说话时自然闭口。\n\n替换后的人物自然融入原场景，身体与环境光线一致，面部在正脸、侧脸和快速运动中保持稳定。不要改变背景，不要增加人物，不要删除其他人物，不要改变原视频镜头，不要出现原人物面孔残留、双脸、五官漂移、身体变形或服装闪烁。";
export const MINIMAX_H3_UNIVERSAL_OBJECT_REPLACEMENT_PROMPT = "以 <Video 1> 为基础进行局部物体替换。\n\n将视频中的【原物体及其位置特征】完整替换为 <Picture 1> 中的【新物体】。准确保留新物体的形状、结构、比例、材质、颜色、纹理、图案、标识和细节。\n\n新物体严格继承原物体在 <Video 1> 中的位置、尺寸、朝向、透视、运动轨迹、速度、旋转、形变状态以及与人物和环境的互动关系。\n\n完整保留原视频中的人物、场景、背景、镜头、构图、运镜、光线、阴影、反射、遮挡、景深、动作节奏和音频。根据原场景的光照和透视自然重建新物体的阴影、反射和接触关系。\n\n只替换指定物体。不要改变人物身份、面部、服装、动作和身体；不要改变其他物体；不要带入 <Picture 1> 的背景、手部、人物、姿势或光线；不要出现原物体残留、物体融合、尺寸漂移、纹理闪烁、穿模、悬浮、复制或额外物体。";
export const MINIMAX_H3_HANDHELD_ITEM_REPLACEMENT_PROMPT = "将 <Video 1> 中人物右手握着的黑色手机，完整替换为 <Picture 1> 中的红色饮料罐。\n\n准确保留饮料罐的圆柱结构、尺寸比例、红色金属材质、标签、拉环和表面高光。饮料罐严格继承原手机的位置、移动轨迹、速度和朝向，同时根据新物体形状自然调整人物右手的握持方式。\n\n保持手掌、手腕、手指数量和关节结构正确。手指自然环绕饮料罐，拇指位于罐体一侧，其他手指产生正确遮挡和接触阴影。物体不得穿过手掌，不得悬浮，不得粘连或复制。\n\n完整保留人物身份、面部、发型、服装、身体动作、背景、镜头、光线和音频。只替换手中的物体，不要改变人物，不要带入参考图中的手、人物和背景，不要出现多余手指、原物体残留或标签闪烁。";
export const MINIMAX_H3_VEHICLE_REPLACEMENT_PROMPT = "将 <Video 1> 中正在道路上行驶的白色轿车，完整替换为 <Picture 1> 中的黑色越野车。\n\n准确保留新车辆的车身结构、车型比例、前脸、车灯、轮毂、车漆、车窗、标识和材质细节。新车辆继承原车辆的行驶路线、速度、转向、刹车、车身起伏和镜头中的空间位置。\n\n车轮与道路正确接触并按照行驶速度自然旋转，车辆运动符合真实物理规律。根据原场景重新生成车漆反射、玻璃反射、车身阴影、轮胎阴影和运动模糊。\n\n保持道路、驾驶员、其他车辆、行人、建筑、天气、镜头运动、构图和音频不变。只替换指定车辆，不要改变道路和其他车辆，不要出现车轮滑动、车身漂移、尺寸突变、车牌乱码或原车辆残留。";
export const MINIMAX_H3_MULTI_PERSON_REPLACEMENT_PROMPT = "以 <Video 1> 为基础进行双人物同步替换。<Picture 1> 只用于定义两个替换角色的外观，忽略参考图中的背景、墙面、阴影、姿势、动作、构图和光线。\n\n角色定义：\n<Subject 1> 是 <Picture 1> 左侧的银色头部、红蓝银配色角色，保留其头部造型、面部结构、胸前发光装置、服装配色、身体比例和全部外观细节。\n\n<Subject 2> 是 <Picture 1> 右侧的黑银色装甲角色，保留其尖锐头部轮廓、黑银装甲结构、胸前红色装置、身体比例、材质和全部外观细节。\n\n人物对应关系：\n将 <Video 1> 中位于前景中央、穿米色毛衣的男子完整替换为 <Subject 1>。\n\n将 <Video 1> 中位于画面右后方、靠近墙壁、穿黑色衣服的男子完整替换为 <Subject 2>。\n\n两名替换角色分别严格继承各自对应原人物的空间位置、身体动作、姿势、手势、头部转动、视线方向、表情节奏、口型变化、走位、运动轨迹和遮挡关系。\n\n语音沿用 <Video 1> 原始音轨，不重新生成或修改。<Subject 1> 和 <Subject 2> 的表情和口型分别逐帧匹配对应原人物及对白时间，禁止串用；不说话时自然闭口。\n\n保持两个人物的对应关系从视频开始到结束始终不变：\n前景人物始终是 <Subject 1>；\n右后方人物始终是 <Subject 2>。\n禁止两名角色身份交换、外观融合、服装互换或在不同帧中互相变成对方。\n\n完整保留 <Video 1> 的场景、墙壁、光线、窗户投影、背景、镜头角度、构图、运镜、景深、剪辑节奏和原始音频。根据原视频光线自然生成两名角色的高光、阴影、墙面投影和环境反射，使其自然融入现场。\n\n只替换这两名指定人物。不要增加第三个人物，不要保留原人物的脸、头发或服装，不要带入 <Picture 1> 的背景。不要出现双脸、原人物残留、角色复制、身份串位、装甲融合、肢体变形、材质闪烁、穿模或人物位置改变。";
export const MINIMAX_H3_CLOTHING_ONLY_REPLACEMENT_PROMPT = "以 <Video 1> 为基础进行人物换装。\n\n仅将 <Picture 1> 中的衣服穿到 <Video 1> 的主要人物身上。准确保留衣服的款式、版型、颜色、材质、纹理、图案、领口、袖口、纽扣、装饰和标识。\n\n完整保留 <Video 1> 中人物原本的身份、面部、五官、发型、肤色、年龄、体型和身体比例，不得替换人物，不得参考 <Picture 1> 中的模特、人体、姿势、背景、光线和构图。\n\n完整保留原视频的动作、表情、走位、镜头、构图、场景、背景、道具、光线、阴影、剪辑节奏和音频。\n\n只替换人物原来的衣服，其他内容全部保持不变。不要改变人物面孔和身体，不要带入参考图中的模特或背景，不要出现原衣服残留、双层衣服、衣服穿模、身体变形、纹理闪烁、图案漂移或多余肢体。";
export const MINIMAX_H3_CLOTHING_AND_HAIRSTYLE_REPLACEMENT_PROMPT = "以 <Video 1> 为基础，仅替换主要人物的衣服和发型。\n\n人物穿着 <Picture 1> 中的完整服装，并采用其中的发型、发色、头发长度和造型。衣服自然贴合身体并随动作产生合理的褶皱和摆动；发型适配人物头型，在运动中保持稳定。\n\n严格保留原视频人物的身份、面孔、五官、脸型、肤色、体型、表情、动作和走位。仅参考 <Picture 1> 的服装与发型，忽略其中的人脸、身体、姿势、背景和光线。\n\n保持原视频的镜头、场景、构图、道具、光影、节奏和音频不变。不要改变人物长相，不要出现身份融合、原服装残留、双层衣服、穿模或纹理闪烁。";
export const MINIMAX_H3_REPLACE_ONE_OF_TWO_PEOPLE_PROMPT = "将 <Video 1> 中位于画面左侧、穿黑色上衣的人物替换为 <Picture 1> 中的人物。\n\n画面右侧人物必须完整保留，身份、面部、服装、动作和位置均不得改变。新人物严格继承左侧原人物的动作、表情、视线、口型、走位及与右侧人物的互动。\n\n语音沿用 <Video 1> 原始音轨，不重新生成或修改。左侧新人物的表情和口型逐帧匹配左侧原人物及对白时间；右侧人物的口型和语音保持不变，不说话时自然闭口。\n\n保持原视频的镜头、背景、灯光、道具、遮挡、空间关系、对白时间和音频不变。只替换指定的左侧人物，不要交换两个人的身份，不要让两张脸融合。";
const TEMPLATES = {
  SceneReference: "{用户输入}, 生成一张四宫格场景图（没有人物）包含（顶视图 (Plan View)，轴测图/45° 俯视图 (Axonometric View)，2个多个正交立面图 (Elevations)）",
  SceneNineView: "根据用户输入的场景描述或上传的参考图，生成一张3×3九宫格场景设定图。\n\n九张图必须表现同一个连续、完整的场景。若提供参考图，以参考图中的空间结构、物体造型、家具位置、门窗位置、材质、颜色、灯光和整体风格为主要依据。参考图未展示的区域只进行最小合理补全，不得随意重新设计场景。\n\n九格固定顺序：\n\n1. 正面视角\n2. 左前方45°\n3. 右前方45°\n4. 左侧视角\n5. 右侧视角\n6. 后方视角\n7. 入口视角\n8. 高空45°俯视\n9. 正交俯视平面布局图\n\n前八格只改变摄影机位置，不改变场景。所有画面中的空间比例、门窗、建筑、家具、主要物体、物品数量、颜色、材质、灯光、天气和物品分布必须保持一致。\n\n第八格是高处45度斜俯视，不是垂直俯视。\n\n第九格必须是与前八格严格对应的二维正交平面布局图。室内场景表现墙体、门窗、房间、家具和入口；户外场景表现建筑、道路、地形、设施和出入口。使用简洁中文标注主要区域。\n\n严格3×3等尺寸排版，每格有细边框和白色中文标题栏。标题依次为：正面视角、左前方45°、右前方45°、左侧视角、右侧视角、后方视角、入口视角、高空45°俯视、平面布局图。\n\n禁止九个不同场景、重复视角、物体随机移动、左右关系颠倒、错误镜像、跨格画面、平面图与场景不一致、中文乱码和英文标签。\n\n{{用户输入}}",
  Panorama360Seamless: {
    type: PROMPT_PRESET_TEMPLATE_TYPE_CONDITIONAL_BY_IMAGE_INPUT,
    imageInputTemplate: "360-degree equirectangular panorama, spherical panorama for VR viewing, seamless 360° wrap-around environment 参考图片场景生成{用户输入}",
    textInputTemplate: "360-degree equirectangular panorama, spherical panorama for VR viewing, seamless 360° wrap-around environment 场景为：{用户输入}",
    emptyInputMessage: "请输入场景或添加参考图片"
  },
  characterRef3View: "生成全身三视图，右边放正视图，45度的侧视图，后视图，{用户输入 || 灰色背景}",
  characterRef3ViewFace: "生成全身三视图以及一张脸部特写（最左边占满三分之一的位置是上半身特写），右边三分之二放正视图，45度的侧视图，后视图，{用户输入 || 灰色背景}",
  characterFrontBackViewFace: "专业角色素材分页布局。左侧则展示角色脸部的大面积高细节特写肖像，突出发型、眼、肤质、妆容及表情。右侧展示同一女性角色的两个全身图，分别为正面和背面视角，重点呈现服装、轮廓、比例及靴子，头部被裁剪，不要显示头部，以突出身体与服饰设计。背景为干净的白色无缝设计，采用极简风格，现代编辑排版，留白整洁\n\n{用户输入}",
  characterRefAnalysis: "生成人设解析图，包含正视图、侧视图、背视图，以及服装细节拆解、面部特征特写，排版紧凑，{用户输入 || 灰色背景}",
  multiGrid4: "生成一张无缝的四宫格（2x2）的连贯剧情分镜图。要求：同一角色的外观、服饰、发型保持一致；场景与光影风格统一；镜头从左上到右下依次推进；每一格都有明确动作与主体，构图干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}",
  multiGrid9: "生成一张无缝的九宫格（3x3）的连贯剧情分镜图。要求：角色一致性极强（外观、服饰、配色不变）；同一场景基调延续；每格推进一个小动作或情绪变化；分镜顺序从左上到右下；画面干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}",
  multiGrid16: "生成一张无缝的十六宫格（4x4）的连贯剧情分镜图。要求：角色与关键道具保持完全一致；每一个分镜都必须是下一个分镜的时间上或因果上的延续，不能跳跃，每格节奏更细（动作拆分、表情递进、镜头切换合理）；整体风格统一；分镜顺序从左上到右下；画面干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}",
  multiGrid25: "生成一张无缝的二十五宫格（5x5）的连贯剧情分镜图。要求：连续叙事、强一致性（角色/服饰/配色/画风固定）；每一个分镜都必须是下一个分镜的时间上或因果上的延续，不能跳跃；镜头语言清晰；分镜顺序从左上到右下；画面干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}",
  storyboardVertical: "请根据我后面提供的【用户输入】，生成一张“专业影视分镜设定板 / Storyboard Board”。\n\n要求：\n1. 输出的是一整张竖版分镜板，不是单张插画，不是漫画页，不是海报。\n2. 整体风格为：黑灰底、细线分栏、专业影视项目提案风格。\n3. 参考图规则：如果用户输入中写了“某角色参考@图片1 / 场景参考@图片2”，则必须严格参考对应图片，保持角色外观、服装、发型、年龄气质、场景结构、时代背景、光影氛围的一致性。\n4. 整张图固定分为三部分：\n   - 顶部标题区：标题、总时长、风格关键词\n   - 中部 Storyboard 区：按用户输入中的时间段拆成 4-6 个 CUT，每行分为左中右三栏：\n     左栏：CUT编号 + 时间段\n     中栏：该镜头对应的电影感画面\n     右栏：主体 / 动作 / 描述 / 镜头 / 台词 / 音效\n5. 分镜画面必须叙事连贯、角色一致、场景一致、服装一致、光影一致。\n6. 所有中间画面都要像电影剧照，镜头语言明确，严格体现用户输入中的动作、表情、氛围和情绪推进。\n7. 右侧说明栏必须用简洁专业的中文排版，字段固定为：\n   主体：\n   动作：\n   描述：\n   镜头：\n   台词：\n   音效：\n8. 文字尽量清晰可读，不要乱码，排版整洁克制，高级感强。\n9. 最终输出只生成一张完整的、专业的、电影级影视分镜设定板。\n\n# 【用户输入】\n{用户输入 || 一段简短剧情}",
  storyboardVerticalScene: "请根据我后面提供的【用户输入】，生成一张“专业影视分镜设定板 / Storyboard Board”。\n\n要求：\n1. 输出的是一整张竖版分镜板，不是单张插画，不是漫画页，不是海报。\n2. 整体风格为：黑灰底、细线分栏、专业影视项目提案风格。\n3. 参考图规则：如果用户输入中写了“某角色参考@图片1 / 场景参考@图片2”，则必须严格参考对应图片，保持角色外观、服装、发型、年龄气质、场景结构、时代背景、光影氛围的一致性。\n4. 整张图固定分为三部分：\n   - 顶部标题区：标题、总时长、风格关键词\n   - 中部 Storyboard 区：按用户输入中的时间段拆成 4-6 个 CUT，每行分为左中右三栏：\n     左栏：CUT编号 + 时间段\n     中栏：该镜头对应的电影感画面\n     右栏：主体 / 动作 / 描述 / 镜头 / 台词 / 音效\n   - 底部补充区：场景图 Secondary（2张小图）+ 光影与氛围 Lighting & Mood（1张小图）+ 色彩板与风格说明（5-6个色块）\n5. 分镜画面必须叙事连贯、角色一致、场景一致、服装一致、光影一致。\n6. 所有中间画面都要像电影剧照，镜头语言明确，严格体现用户输入中的动作、表情、氛围和情绪推进。\n7. 右侧说明栏必须用简洁专业的中文排版，字段固定为：\n   主体：\n   动作：\n   描述：\n   镜头：\n   台词：\n   音效：\n8. 文字尽量清晰可读，不要乱码，排版整洁克制，高级感强。\n9. 最终输出只生成一张完整的、专业的、电影级影视分镜设定板。\n\n# 【用户输入】\n{用户输入 || 一段简短剧情}",
  storyboardHorizontal: "请根据我后面提供的【用户输入】，生成一张“横版专业影视故事板 / Storyboard Sheet”。  \n要求： \n1. 输出必须是一整张横版16:9故事板表格，不是海报，不是漫画页，不是竖版分镜板。 \n2. 主体必须是“表格结构”，每一行对应一个 CUT。 \n3. 表头固定为： CUT｜秒数｜图片内容｜场景｜主体｜动作｜描述｜镜头｜台词｜音效｜色彩/光影 \n4. 按用户输入中的时间顺序，从上到下排列所有 CUT。 \n5. “图片内容”列中，每个 CUT 必须对应一张横向16:9的电影感分镜画面，真实人物质感，镜头语言明确。 \n6. “场景”列用于写该镜头的环境与空间信息。 \n7. “色彩/光影”列用于写该镜头的色调、光源、冷暖关系与氛围重点。 \n8. 其余列分别填写该镜头的主体、动作、描述、镜头、台词、音效，文字风格必须像正规影视故事板备注，简洁、专业、整齐。 \n9. 如果用户输入中有“角色参考@图片1 / 场景参考@图片2 / 道具参考@图片3”，必须严格参考并保持角色、服装、场景、氛围一致。 \n10. 整体风格为黑灰底、细线分栏、专业影视提案风格。 \n11. 最终只输出一张完整的横版故事板表格图。  \n#【用户输入】\n{用户输入 || 一段简短剧情}",
  storyboardHorizontalScene: "请根据我后面提供的【用户输入】，生成一张“横版专业影视故事板 / Storyboard Sheet”。  \n要求： \n1. 输出必须是一整张横版16:9故事板表格，不是海报，不是漫画页，不是竖版分镜板。 \n2. 主体必须是“表格结构”，每一行对应一个 CUT。 \n3. 表头固定为： CUT｜秒数｜图片内容｜场景｜主体｜动作｜描述｜镜头｜台词｜音效｜色彩/光影 \n4. 按用户输入中的时间顺序，从上到下排列所有 CUT。 \n5. “图片内容”列中，每个 CUT 必须对应一张横向16:9的电影感分镜画面，真实人物质感，镜头语言明确。 \n6. “场景”列用于写该镜头的环境与空间信息。 \n7. “色彩/光影”列用于写该镜头的色调、光源、冷暖关系与氛围重点。 \n8. 其余列分别填写该镜头的主体、动作、描述、镜头、台词、音效，文字风格必须像正规影视故事板备注，简洁、专业、整齐。 \n9. 如果用户输入中有“角色参考@图片1 / 场景参考@图片2 / 道具参考@图片3”，必须严格参考并保持角色、服装、场景、氛围一致。 \n10. 整体风格为黑灰底、细线分栏、专业影视提案风格。 \n11. 表格底部增加一条补充信息区，包含：场景总设定、综合色彩色板、整体风格说明。 \n12. 最终只输出一张完整的横版故事板表格图。  \n#【用户输入】\n{用户输入 || 一段简短剧情}",
  longToShort: "\n    {用户输入} # 对以上的小说剧情文案进行大幅精简（目标篇幅约为原文的50*-70%）\n完整保留原文对话，同时按照“对白驱动剧情”的结构重新梳理旁白与独白，保留原文段落结构与标点符号。\n用第一人称进行改文\n锁定所有对话： 识别并保护所有直接引语，确保一字不改。\n构建开篇（10%）： 提炼原文关键背景（时代、世界观、人物身份），用简短叙事交代框架。\n精简叙事（20%）： 大幅删减环境描写和过度修饰，仅保留连接对话必要的动作和场景推进。\n筛选独白（30%）： 保留能强化冲突、体现人物压力和真实状态的核心心理描写，删去流水账式的心理活动。\n格式输出： 保持小说文本格式，保留标点符号，保留原段落分行（必要时可合并过碎的描述段落，但不可合并对话段落）。\n# 结构与内容规则\n## 【整体篇幅控制】\n总字数目标： 控制在原文的 50-70% 左右。\n精简策略： 由于对话不能动，主要通过大幅删减“非对话部分的废话”来达成字数减半的目标。\n## 【文本结构比例】\n对白（核心）： 占比最高。严格保持原文，不得增删改一字。\n内心独白（约30%）： 紧贴对话，用于强化情绪、痛感、压迫或绝望。\n叙事（约20%）： 仅作铺垫和连接，禁止写成分镜（如“镜头一转”），禁止扩写。\n背景（约10%）： 开篇必须交代，不可省略。\n##【写作形式与风格】\n输出格式： 纯正的小说文本，保留标点符号，保留段落感。\n风格要求： 对白驱动剧情。通过精简旁白，让对话节奏更紧凑，冲突更集中。\n## 禁止项：\n❌ 禁止出现分镜词（特写、远景、淡入淡出）。\n❌ 禁止出现时间轴（0-5秒）。\n❌ 禁止删除或修改任何一句对话。\n❌ 禁止新增原文没有的情节或设定。\n## 情绪与逻辑\n逻辑： 尽管大幅删减了旁白，必须确保对话与动作的衔接流畅，事件顺序严格遵照原文。\n氛围： 突出原文中的冲突与张力，保留关键的情绪转折点。\n## 输出要求\n直接输出修改后的完整文案。\n保留标点符号和段落格式。",
  extractInfo: "{用户输入}\n# 筛选出以上故事里的角色（包括主要怪物）、场景以及道具物品\n把以上每个角色根据剧情写出详细中文提示词包括五官相貌，脸型，发型，全身服饰提示词。重要物品，场景\n用 --- 符号来分割每一个角色,先把人设输出完毕，最后再输出场景，如有角色不同状态也需要标注出来(但不需要太详细)，不用输出多余说明，不带有格式\n# 输出示例：\n\n#人设\n1. 主角：沈仪\n# 中文提示词：\n1个青年男性，古风，捕快，英俊硬朗，剑眉星目，黑色长发，凌乱发髻，身穿古代黑色官差制服，衣衫不整，暗黑武侠，电影光效。\n# 中文提示词(受伤状态)：\n.....\n\n---\n\n2. 配角：刘家丫头\n...\n...\n...\n\n---\n# 重要物品\n1. 腰间佩戴的一把制式长刀（佩刀），刀柄古旧；\n2. 。。。。\n# 场景：\n1. 昏暗的破旧土屋或夜晚的院落，月光惨白，暗黑压抑氛围。\n2. ....\n",
  Storyboard1: "## 核心任务\n你是一个专业的AI分镜脚本生成器。任务是基于提供的文本信息，生成“视频提示词”的分镜脚本，分割后的上下分镜必须十分丝滑的连贯。\n\n# 输入信息\n\n**故事情节：**\n{用户输入}\n\n# 视频提示词原则\n\n## 视觉关键词密集度\n\n- 规则：为最大化 AI 模型对画面的控制力，必须使用大量具体的、高辨识度的视觉描述词汇\n- 场景、角色、光影、特效必须混合使用（例如：“幽蓝色的霓虹线路”、“血红色的赛博月亮”、“凌厉的金色电光”、“数码化的爆炸效果”）。\n\n## 运镜的专业化和指令化\n\n- 规则：采用专业电影术语而非简单描述，以明确规定画面的动态行为。\n- 严格使用【超广角】、【特写】等**景别**，以及【慢速推轨】、【环绕慢摇】、【动态手持】等**镜头运动**指令。\n\n## *动作的分解与强调\n\n- 逻辑：复杂的动作不能一笔带过，必须分解成关键帧和关键特写，确保动作的冲击力。\n- 使用【爆发式跃出】（远景）接【腰部极限扭转】（近景），再接【接触的瞬间】（慢动作特写），突出高速和高冲击。\n\n## 人物台词\n- 原文中的对话内容不允许进行擅自删改。要把输入文案作为唯一的信息来源，忠实地将其内容转化为分镜脚本，避免添加任何文案中未提及的情节、动作、场景或角色心理活动。\n- 对话要用“”标示出来。\n\n## 时长与节奏的控制：\n\n- 为每个分镜设定一个合理的时长，以控制最终视频的节奏感。短时间用于高冲击特写，长时间用于场景铺垫或关键动作。\n- 提示词应用的视频时长15秒及以内，剧本包含画面，运镜，所以每一幕的提示词不能超过该时间\n\n## 听觉元素\n\n- 在关键动作后备注音效提示，如“尖锐的破空声与低沉的能量轰鸣”或“无台词，只有金属、能量、符文破碎的声音”。\n\n# 输出格式严格遵循的规则：\n1.  保持连续性：\n    - 为保证场景一致性，若前后剧情为统一场景则需要延续上一则剧本的场景\n\n2.  剧情不能改变：\n    - 保留剧情上的所有对话。 \n\n3.  设定角色、场景映射：\n    - 但凡该幕出场的所有角色都应该有角色映射（[人名]参考@图片参考@音频）\n\n4.  输出格式：\n    - 按顺序输出分镜描述，不需要解释或分析过程。\n    - 输出的内容应当没字体样式。\n\n5. **提示词推理限制：不得出现任何违禁词，违禁词包括词典如下**：\n\n“ 血液相关：血液飞溅、喷血、鲜血淋漓、血池、血祭、断头血、内脏出血、血腥场面、血债、血洗\n暴力场景：分尸、碎尸、斩首、砍头、挖眼、掏心、剥皮、凌迟、虐杀、酷刑、断肢、爆头、穿刺、撕咬\n其他暴力：屠杀、灭门、焚尸、鞭尸、尸横遍野、血肉模糊、骨裂、脑浆、内脏外露、残肢断臂\n裸露低俗类：全裸、半裸、袒胸露背、露脐、露臀、露私密部位、一丝不挂、裸体、赤裸 低俗暗示：性感暴露、挑逗性裸露、低俗姿势、暴露隐私部位、酥胸半露、衣不蔽体\n违规场景：色情暗示、艳情、低俗互动、性挑逗、裸露祭祀\n色情与性暗示类：色情、淫秽、嫖娼、卖淫、性交易、一夜情、通奸、乱伦、恋童、兽交 暗示类：约炮、撩骚、打炮、床上戏、胸器、美腿诱惑、性感撩拨、暧昧低俗、艳舞、脱衣舞 敏感部位描述：乳房、阴部、阴茎、臀部\n其他高危敏感词封建迷信：血腥祭祀、活人献祭、血咒、尸变、僵尸吸血、妖魔鬼怪（恐怖化描述，如 \"食人恶鬼\"） \n危害公序良俗：自残、自杀、暴力教唆、聚众斗殴、黑帮火拼、恐怖袭击、校园暴力\n敏感宗教 / 政治：邪教仪式、极端宗教、分裂、恐怖组织、反动、颠）”\n\n# 固定的模板格式\n    - 使用 ---  作为每一幕提示词的分隔符。 \n    - 提示词第一部分：最顶部固定是（第X幕）无字幕，无BGM\n    - 第二部分为内容（每一幕都用动作来收尾，为了更好的衔接视频上下文）。\n    - 场景基调要固定好！为了更好的衔接上下镜头（如：秋季，大风，漆黑的夜晚）。\n\n## 输出样例\n第一幕：\n无字幕，无BGM\n沈仪的形象参考@图片1音色参考@音频1，犬妖参考@图片2音色参考@音频2\n夜晚，破旧院落。\n【中景镜头】，沈仪脸上挤出僵硬的笑容，用肩膀撞了一下犬妖的胳膊。\n（人声强颜欢笑） 沈仪说：“老弟的本事你还不清楚，哪里快的起来。走走走，今晚我请酒。”\n沈仪试图推着犬妖往外走，但犬妖纹丝不动。\n犬妖低头俯视沈仪，眼神冰冷漠然。\n犬妖甩开沈仪的手，转身走向院内。沈仪下意识伸手去拦，被犬妖毛茸茸的爪子一把抓住手腕。\n（人声冷漠）犬妖说：“伱当我是蠢猪？”\n【特写镜头】，犬妖猛然贴近沈仪的脸，张开满是尖牙的大嘴，唾液拉丝。\n\n--- \n\n第二幕：\n无字幕，无BGM\n沈仪的形象参考@图片1音色参考@音频1，犬妖参考@图片4音色参考@音频3\n夜晚，破旧院落。\n【特写镜头】，犬妖猛然贴近沈仪的脸，张开满是尖牙的大嘴，唾液拉丝。\n（人声愤怒）犬妖说：“姓沈的，你好像真拿自己当个东西了。里面的动静我听的清清楚楚，你他妈敢反水？！”\n【镜头快速后拉】，犬妖抬起粗壮的大腿猛地蹬向沈仪腹部。\n沈仪面部表情扭曲，整个人如破麻袋般倒飞出去，撞破屋门摔入屋内。\n（人声痛苦）沈仪说：“不是，你属狗的？说翻脸就翻脸？”\n（人声愤怒）犬妖说：“给脸不要脸的东西，合该拿你一起来祭我五脏六腑。”\n沈仪瘫软在地，用力捂住小腹\n",
  Storyboard2: "## 核心任务\n你是一个专业的AI分镜脚本生成器。任务是基于提供的文本信息，生成“视频提示词”的分镜脚本，分割后的上下分镜必须十分丝滑的连贯。\n# 输入信息\n\n**故事情节：**\n{用户输入}\n\n# 视频提示词原则\n\n## 视觉关键词密集度\n\n- 规则：为最大化 AI 模型对画面的控制力，必须使用大量具体的、高辨识度的视觉描述词汇\n- 场景、角色、光影、特效必须混合使用（例如：“幽蓝色的霓虹线路”、“血红色的赛博月亮”、“凌厉的金色电光”、“数码化的爆炸效果”）。\n\n## 运镜的专业化和指令化\n\n- 规则：采用专业电影术语而非简单描述，以明确规定画面的动态行为。\n- 严格使用【超广角】、【特写】等**景别**，以及【慢速推轨】、【环绕慢摇】、【动态手持】等**镜头运动**指令。\n\n## *动作的分解与强调\n\n- 逻辑：复杂的动作不能一笔带过，必须分解成关键帧和关键特写，确保动作的冲击力。\n- 使用【爆发式跃出】（远景）接【腰部极限扭转】（近景），再接【接触的瞬间】（慢动作特写），突出高速和高冲击。\n\n## 人物台词\n- 原文中的对话内容不允许进行擅自删改。要把输入文案作为唯一的信息来源，忠实地将其内容转化为分镜脚本，避免添加任何文案中未提及的情节、动作、场景或角色心理活动。\n- 对话要用“”标示出来。\n\n## 时长与节奏的控制：\n\n- 为每个分镜设定一个合理的时长，以控制最终视频的节奏感。短时间用于高冲击特写，长时间用于场景铺垫或关键动作。\n- 提示词应用的视频时长15秒及以内，剧本包含画面，运镜，所以每一幕的提示词不能超过该时间\n\n## 听觉元素\n\n- 在关键动作后备注音效提示，如“尖锐的破空声与低沉的能量轰鸣”或“无台词，只有金属、能量、符文破碎的声音”。\n\n# 输出格式严格遵循的规则：\n1.  保持连续性：\n    - 为保证场景一致性，若前后剧情为统一场景则需要延续上一则剧本的场景\n\n2.  剧情不能改变：\n    - 保留剧情上的所有对话。 \n\n3.  设定角色、场景映射：\n    - 但凡该幕出场的所有角色都应该有角色映射（[人名]参考@图片参考@音频）\n\n4.  输出格式：\n    - 按顺序输出分镜描述，不需要解释或分析过程。\n    - 输出给我的内容应当没字体样式。\n\n5. **提示词推理限制：不得出现任何违禁词，违禁词包括词典如下**：\n\n“ 血液相关：血液飞溅、喷血、鲜血淋漓、血池、血祭、断头血、内脏出血、血腥场面、血债、血洗\n暴力场景：分尸、碎尸、斩首、砍头、挖眼、掏心、剥皮、凌迟、虐杀、酷刑、断肢、爆头、穿刺、撕咬\n其他暴力：屠杀、灭门、焚尸、鞭尸、尸横遍野、血肉模糊、骨裂、脑浆、内脏外露、残肢断臂\n裸露低俗类：全裸、半裸、袒胸露背、露脐、露臀、露私密部位、一丝不挂、裸体、赤裸 低俗暗示：性感暴露、挑逗性裸露、低俗姿势、暴露隐私部位、酥胸半露、衣不蔽体\n违规场景：色情暗示、艳情、低俗互动、性挑逗、裸露祭祀\n色情与性暗示类：色情、淫秽、嫖娼、卖淫、性交易、一夜情、通奸、乱伦、恋童、兽交 暗示类：约炮、撩骚、打炮、床上戏、胸器、美腿诱惑、性感撩拨、暧昧低俗、艳舞、脱衣舞 敏感部位描述：乳房、阴部、阴茎、臀部\n其他高危敏感词封建迷信：血腥祭祀、活人献祭、血咒、尸变、僵尸吸血、妖魔鬼怪（恐怖化描述，如 \"食人恶鬼\"） \n危害公序良俗：自残、自杀、暴力教唆、聚众斗殴、黑帮火拼、恐怖袭击、校园暴力\n敏感宗教 / 政治：邪教仪式、极端宗教、分裂、恐怖组织、反动、颠）”\n\n# 固定的模板格式\n    - 使用 ---  作为每一幕提示词的分隔符。 \n    - 提示词第一部分：最顶部固定是（第X幕）无字幕，无BGM\n    - 第二部分为内容（可以的话每一幕都用动作来收尾，为了更好的衔接视频上下文）。\n    - 场景基调要固定好！为了更好的衔接上下镜头（如：秋季，大风，漆黑的夜晚）。\n\n# 输出样例\n第1幕\n无字幕，无BGM\n沈仪参考@图片1，刘家丫头参考@图片2\n场景参考@图片4 昏暗潮湿的土屋，夜间，油灯摇曳，阴冷压抑的色调，空气中漂浮尘埃。\n0-1.5s：【特写】沈仪猛然睁眼，满头冷汗，呼吸急促。镜头快速推向其手掌，指缝间沾染暗红印记\n1.5-3s：【主观镜头】沈仪视线。床脚刘家丫头衣衫凌乱、瑟瑟发抖；身侧老头佝偻，手中木棒顶端滴落粘稠暗色液体。\n3-6s：【中景】沈仪按着后脑，神情痛苦狰狞，戾气在眉宇间聚集。\n6-9s：【特写】沈仪咬牙，眼神凶狠，胸膛剧烈起伏。\n（愤怒）沈仪：“嗬哧！……我说……”\n音效：沉重的喘息声，心跳如鼓点，油灯爆裂的滋滋声。\n9-15s：【低角度特写】刘丫头突然扑上前来，双手死死抱住沈仪小腿，神情绝望癫狂。\n（惊恐）刘丫头：“爷！我给您！我什么都给您！您放俺爹回乡下好不好？”\n\n--- \n\n第2幕\n.....\n.....\n.....",
  Seedance2VideoFormat: "{用户输入}\n如用户指定秒数就按照用户的来，如没指定就按照15秒来写提示词，不要输出多余内容。严格按照下面格式输出提示词\nx-xs：景别，行为\nx-xs：景别，行为\nx-xs：景别，行为\n示例：0-1s：特写镜头，人物拿起刀.............../"
};
const STORYBOARD_PROMPT_TEMPLATES = {
  filmStoryboard: "做一张 3×4 的电影分镜网格，共 12 格，所有画面都出现同一个角色：一位短发亚洲女性，25岁左右，黑色齐耳短发，五官清冷精致，穿米白色长风衣、白色内搭、浅蓝牛仔裤和黑色短靴，气质独立、安静、有故事感。场景设定为：晴天下午的东京街头，干净街道、便利店、斑马线、路边电线杆、远处城市建筑，光线明亮柔和，有空气感。\n  12 格分别表现不同景别与镜头语言：正面近景、眼神特写、背影中景、侧脸特写、过肩镜头、全身远景、低角度仰拍、街角行走、回头瞬间、手部细节、风吹衣摆、黄昏街头收尾镜头。\n  每一格都要保持角色身份高度一致，包括脸型、发型、服装、气质和色彩设定。画面整体明亮、清晰、有电影感，构图丰富但统一，像专业影视前期分镜稿。风格参考：都市电影前期分镜、日系清新电影感、明亮写实插画。避免角色变脸、服装变化过大、画面过暗、杂乱背景、低质量线稿。",
  advertisingStoryboard: "生成一张 16:9 横版高清广告前期制作板，主题为「泰国冰汽水广告故事板」。整体采用深蓝色信息板底色，白色细线分区，画面整洁、商业感强，像专业广告提案板。\n  包含艺术指导、角色与风格参考、环境与场景设计、8 格故事板、灯光情绪、关键词、音频音调、镜头类型等模块。整体是明亮清凉的热带动漫广告风格，画面中冰块、气泡、水花、冷凝水、阳光高光非常明显，色彩清爽，角色一致性高，场景统一，适合品牌广告前期制作展示。",
  gameStoryStoryboard: "生成一张「修仙缘起」的 15 秒剧情分镜图，整体风格为黑金复古、东方美学、水墨意境。画面采用专业游戏 CG 动画前期分镜版式，包含 6 个连续分镜。\n  6 个分镜依次表现：灵根觉醒的神秘山门场景、古老测试石碑发出微光、主角缓缓走近并触碰石碑、金色符文从石碑中浮现、天灵根被选中的震撼瞬间、主角手指悬停在发光符文前的特写。\n  要求画面风格统一，角色形象一致，动作连贯，镜头衔接自然，情绪从疑惑、紧张到震撼与觉醒逐步变化。整体具有黑金东方玄幻质感、水墨氛围、电影级光影和游戏剧情宣传片的视觉冲击力。",
  sportsTrainingStoryboard: "生成一张 16 步篮球训练动作示意图，采用 4×4 网格布局。主角是一名年轻篮球运动员，穿着 oversized 篮球衫、黑色短裤、连脚袜和高帮运动鞋。每个格子展示一个不同的篮球训练动作，包括原地运球、交叉步运球、胯下运球、背后运球、变向突破、急停跳投、三威胁姿势、防守滑步、转身护球、上篮起步、抛投动作、后撤步投篮、接球投篮、低位脚步、传球姿势、投篮收尾。\n  风格为彩色铅笔画，色调柔和，能看出铅笔纹理。要求动作清晰，身体姿势、篮球位置、手部动作、脚的站位和重心变化明显不同。背景干净，网格排版整齐，适合作为篮球训练教学动作示意图。",
  animationStoryboard: "生成一张「发光森林冒险」的动画故事板，整体风格为可爱卡通、明亮奇幻、童话冒险。画面采用专业动画前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：萤火虫入口发出微光，小主角走进森林；主角发现一颗发光种子；沿着盘绕的树根小路前进；古树裂缝缓缓睁开像眼睛一样发光；神秘守夜者从树影中出现并开口说话；主角在藤蔓追赶中惊险躲避；发光种子被放入古树中心，点亮整片森林；最后以蓝色月光下的森林全景收尾。\n  每个分镜包含简单对白气泡，例如「这里好亮！」「它在呼唤我们」「快跑！」「森林醒来了」。要求角色一致，动作连贯，情绪从好奇、惊讶、紧张到温暖治愈逐步变化。画面风格统一，色彩明亮，分镜清晰，像专业动画故事板。",
  musicVideoStoryboard: "生成一张「霓虹雨夜」的 MV 音乐视频故事版，整体风格为赛博都市、霓虹灯光、孤独浪漫。画面采用专业音乐视频前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：雨夜城市远景，霓虹灯在湿润街道上反射；女歌手撑着透明雨伞走进画面；近景拍摄她低头轻唱第一句歌词；街边广告屏闪烁蓝紫色光；副歌部分她站在天桥中央，身后车流形成光轨；舞蹈段落中多人剪影在雨中起舞；情绪高潮时女歌手抬头看向天空，雨滴被霓虹照亮；最后以清晨微光下空荡街道收尾。\n  每个分镜加入简短歌词片段或情绪提示，例如「雨落下时，我还在等你」「城市不说话」「灯光替我记得你」。要求角色一致，情绪从孤独、克制到释放再到释然，画面统一，灯光高级，像专业 MV 故事板。",
  comicStoryboardPage: "生成一张「午夜觉醒」的漫画分镜页，整体风格为现代热血青年漫画、黑白墨线、局部红色强调。画面采用专业漫画页构图，包含 8 个大小不同的分镜。\n  8 个分镜依次表现：深夜城市天台，男主独自站在风中；眼神特写，瞳孔中出现红色光芒；手机收到神秘信息「你被选中了」；天空突然裂开，黑色能量降落；男主被冲击波震退，手臂浮现金色符文；敌人剪影从烟雾中出现；男主握紧拳头，能量爆发；最后一格为大画幅英雄站姿，男主说「从现在开始，由我决定命运。」\n  加入对白气泡、速度线、冲击线、墨迹飞溅和音效字，例如「轰！！」「咔嚓」「嗡——」。要求分镜节奏紧张，情绪从疑惑、震惊到觉醒爆发，画面统一，像正式漫画连载页。",
  socialShortVideoStoryboard: "生成一张「5分钟整理书桌」的社交媒体短视频分镜图，整体风格为清新生活方式、小红书感、明亮治愈。画面采用短视频脚本前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：开头钩子，凌乱书桌特写，字幕「你的桌面是不是也这样？」；人物皱眉看着桌面；清空桌面，把物品分类；擦拭桌面，阳光照进房间；摆放收纳盒、笔筒和台灯；整理前后对比画面；人物坐下开始学习，表情放松；最后展示干净桌面全景，字幕「5分钟，让学习状态回来」。\n  要求字幕清晰，镜头有近景、俯拍、对比镜头和全景，节奏从混乱到治愈，画面明亮统一，适合短视频拍摄前期分镜。",
  brandPromotionStoryboard: "生成一张「LUMO 智能台灯」的品牌宣传故事版，整体风格为现代极简、温暖科技、生活方式广告。画面采用专业品牌宣传片前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：夜晚书桌前，年轻设计师疲惫地揉眼睛；桌面光线昏暗，设计稿散落；LUMO 智能台灯轻轻亮起，柔和光线覆盖桌面；手机 App 自动调节亮度与色温；设计师重新开始绘图，表情放松；清晨阳光进入房间，作品完成；台灯与整洁桌面形成高级产品特写；最后品牌口号出现：「LUMO，让灵感被温柔照亮。」\n  要求品牌感高级，产品出现自然，人物情绪从疲惫到专注再到满足，画面干净统一，像真实品牌宣传片故事板。",
  tutorialStoryboard: "生成一张「手冲咖啡教学」的教程类分镜图，整体风格为温暖生活方式、极简插画、咖啡馆氛围。画面采用清晰步骤教学版式，包含 8 个连续步骤分镜。\n  8 个步骤依次表现：准备滤杯、滤纸、咖啡豆和手冲壶；研磨咖啡豆；放入滤纸并用热水润湿；倒入咖啡粉并轻轻铺平；第一次注水进行闷蒸；分三次画圈注水；咖啡滴滤完成；倒入杯中并展示成品咖啡。\n  每个分镜加入箭头、编号和简短说明文字，例如「研磨」「润湿滤纸」「闷蒸30秒」「缓慢注水」。要求动作清晰、器具位置准确、步骤连贯，画面干净高级，像专业教程信息图。",
  hdFilmProductionBoard: "创建一张 16:9 横版高清电影制作板 / 视觉规划表，主题为「奔驰跑车性能广告」。整体呈现高端汽车广告前期制作板风格，布局简洁、结构清晰、分区明确，具有影视级商业质感，适合作为导演拍摄指南。\n  画面主体围绕一辆银灰色奔驰 AMG 跑车，强调速度、精准、豪华、操控和夜间赛道性能。整体视觉为深色高级底板，搭配白色细线分区、冷蓝灯光、银灰金属质感、红色尾灯轨迹和少量品牌红色点缀。\n  顶部栏为艺术指导区，展示项目概述：16:9 赛车性能短片、8 个主要镜头、夜晚赛车场环境、统一色卡、影片基调关键词。色卡包括深黑、炭灰、银灰、冷蓝、尾灯红。\n  左侧为车辆与赛车手风格参考区：展示奔驰跑车的正面、侧面、背面、车灯特写、轮毂特写、内饰方向盘、车标细节；同时展示赛车手在车内的驾驶姿态参考，赛车手必须佩戴黑色全盔、黑色赛车服、赛车手套，形象保持一致，不出现车外站立画面。\n  中上区域为环境与场景设计：展示一个极具电影感的夜晚赛车场，湿润赛道反射冷蓝灯光，远处看台、泛光灯、赛道护栏、弯道漂移区域清晰可见。旁边加入俯视赛道示意图，用红色路线标出赛车移动路径，并标注摄像机位置、跟拍点、漂移弯道、低机位、车内镜头、无人机俯拍等镜头类型。\n  中部为 8 格故事板分镜，所有分镜为 16:9 小画幅，编号清晰，展示完整拍摄流程：\n  1. 夜晚赛车场广角建立镜头，奔驰跑车进入赛道；\n  2. 低机位车头推进，车灯划破黑暗；\n  3. 车内特写，赛车手戴头盔握紧方向盘；\n  4. 轮胎与地面微距，轮胎打滑，水花和烟雾飞溅；\n  5. 跑车高速过弯漂移，加入强烈运动模糊；\n  6. 车尾跟拍，红色尾灯形成光轨；\n  7. 无人机俯拍，车辆沿赛道路线高速穿梭；\n  8. 英雄收尾镜头，跑车停在赛道灯光下，车身反射高级冷光。\n  每个分镜下方加入小型信息条，标注镜头类型、景别、运动方式、动作描述和情绪进展，例如：广角 / 中景 / 特写 / 微距，静态 / 跟拍 / 低机位 / 手持 / 航拍，速度感、压迫感、精准操控、胜利收束。\n  底部模块包含灯光与情绪、关键词、音频音调、镜头语言与后期风格。灯光强调冷蓝赛道灯、红色尾灯、金属反光、湿地反射和高对比阴影；关键词包括性能、速度、精准、控制、豪华、夜赛、漂移；音频包括低频电子音乐、引擎轰鸣、轮胎摩擦、水花飞溅、风噪和加速声浪；镜头语言包括低角度推进、车内主观镜头、轮胎微距、跟车镜头、无人机俯拍、运动模糊和高速剪辑。\n  整体画面必须保持专业、整洁、连贯、商业广告感强，分镜节奏清晰，禁止出现赛车手在车外的画面，赛车手始终在车内并佩戴头盔。画面要一眼传达奔驰跑车的速度、力量、精密操控和高级豪华气质。",
  xianxiaGuomanStoryboard: "创建一张 16:9 横版高清「30 秒科幻修仙国漫影视视觉开发板」，参考好莱坞工业化电影前期制作标准，整体为冷调写实电影质感、东方玄幻美学、未来科技感和国漫高燃叙事风格。\n  画面采用高级深色信息板排版，分为 6 大模块：顶部项目信息栏，展示片名、时长、类型、调性、镜头数量和主色调；左上双主角人设设计栏，展示两位主角的正面、侧面、背面三视图、面部特写、服装细节、武器法器和科技装备，角色造型必须高度一致；右上核心场景概念图，展示悬浮仙城、灵能天门、赛博仙山或量子阵法等宏大科幻修仙场景；中部 3 组连续镜头故事板序列，展示镜头编号、景别、运镜、动作和情绪推进；镜头运动与技术示意区，包含运镜轨迹、相机运动流程、机位图标和空间调度；底部专业技术参数栏，展示灯光氛围、色卡、镜头参数、后期风格、音频基调和视觉关键词。\n  整体要求专业影视工业级排版，信息密度高但清晰有序，画面统一精致，角色不变脸，文字不混乱，无低质拼贴。色调以冷蓝、玄黑、银灰、暗金、灵能青和能量白为主。4K 超清，ultra-detailed，professional film production layout，cinematic shot design，适配 Seedance 2.0 专业视频生成。」\n  整体视觉要求：\n   高级教程海报、清晰排版、上下结构明确、标题醒目、提示词区域可读性强、留白合理、设计感强。严格保持 3:4 教程图模板结构，不要把整张图做成横版影视视觉开发板。不要杂乱，不要低质截图感，不要文字堆叠混乱，不要廉价海报风。"
};
const STORYBOARD_INSERT_PROMPT_PRESETS = [{
  templateKey: "filmStoryboard",
  title: "电影分镜故事板",
  desc: "电影镜头故事板模板"
}, {
  templateKey: "advertisingStoryboard",
  title: "广告故事板",
  desc: "广告创意故事板模板"
}, {
  templateKey: "gameStoryStoryboard",
  title: "游戏剧情故事板",
  desc: "游戏剧情演出故事板模板"
}, {
  templateKey: "sportsTrainingStoryboard",
  title: "体育训练故事板",
  desc: "体育训练动作故事板模板"
}, {
  templateKey: "animationStoryboard",
  title: "动画故事板",
  desc: "动画镜头故事板模板"
}, {
  templateKey: "musicVideoStoryboard",
  title: "MV音乐视频故事板",
  desc: "音乐视频画面故事板模板"
}, {
  templateKey: "comicStoryboardPage",
  title: "漫画分镜页",
  desc: "漫画页面分镜模板"
}, {
  templateKey: "socialShortVideoStoryboard",
  title: "社交媒体短视频分镜",
  desc: "短视频节奏分镜模板"
}, {
  templateKey: "brandPromotionStoryboard",
  title: "品牌宣传故事版",
  desc: "品牌宣传画面故事版模板"
}, {
  templateKey: "tutorialStoryboard",
  title: "教程类分镜图",
  desc: "教程步骤画面分镜模板"
}, {
  templateKey: "hdFilmProductionBoard",
  title: "高清电影制作板",
  desc: "高清电影制作板模板"
}, {
  templateKey: "xianxiaGuomanStoryboard",
  title: "修仙国漫故事板",
  desc: "修仙国漫剧情故事板模板"
}];
const IMAGE_PRESET_EMPTY_INPUT_MESSAGE = "请输入提示词或添加参考图片";
const staticPromptTemplate = _0x3f1822 => ({
  type: PROMPT_PRESET_TEMPLATE_TYPE_STATIC,
  text: _0x3f1822,
  requireInput: true,
  emptyInputMessage: IMAGE_PRESET_EMPTY_INPUT_MESSAGE
});
const storyboardInsertPromptPreset = ({
  templateKey: _0x3b908d,
  title: _0x4919f5,
  desc: _0x4debbf
}) => ({
  icon: "🎬",
  title: _0x4919f5,
  desc: _0x4debbf,
  triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
  template: staticPromptTemplate(STORYBOARD_PROMPT_TEMPLATES[_0x3b908d])
});
function localizePromptPresetTemplate(_0x18d9c3, _0x2fdec5 = "") {
  const _0x39460b = _0x2fdec5 ? optionalPromptPresetsText("presets." + _0x2fdec5 + ".template") : "";
  if (typeof _0x18d9c3 === "string") {
    return _0x39460b || _0x18d9c3;
  }
  if (!_0x18d9c3 || typeof _0x18d9c3 !== "object") {
    return _0x18d9c3;
  }
  const _0x5f3f98 = {
    ..._0x18d9c3
  };
  if (_0x39460b && _0x5f3f98.type === PROMPT_PRESET_TEMPLATE_TYPE_STATIC) {
    _0x5f3f98.text = _0x39460b;
  }
  if (_0x5f3f98.type === PROMPT_PRESET_TEMPLATE_TYPE_CONDITIONAL_BY_IMAGE_INPUT) {
    const _0xfc606f = _0x2fdec5 ? optionalPromptPresetsText("presets." + _0x2fdec5 + ".imageInputTemplate") : "";
    const _0xd19875 = _0x2fdec5 ? optionalPromptPresetsText("presets." + _0x2fdec5 + ".textInputTemplate") : "";
    if (_0xfc606f) {
      _0x5f3f98.imageInputTemplate = _0xfc606f;
    }
    if (_0xd19875) {
      _0x5f3f98.textInputTemplate = _0xd19875;
    }
  }
  const _0x149961 = String(_0x5f3f98.emptyInputMessage || "");
  if (_0x149961 === IMAGE_PRESET_EMPTY_INPUT_MESSAGE) {
    _0x5f3f98.emptyInputMessage = promptPresetsText("emptyInput.image");
  } else if (_0x149961 === TEMPLATES.Panorama360Seamless.emptyInputMessage) {
    _0x5f3f98.emptyInputMessage = promptPresetsText("emptyInput.panorama");
  }
  return _0x5f3f98;
}
function localizePromptPresetItem(_0x31d1f5 = {}) {
  const _0x329f44 = String(_0x31d1f5?.title || "");
  const _0x3732b3 = PROMPT_PRESET_TITLE_I18N_KEYS[_0x329f44] || "";
  const _0x3ea8d3 = {
    ..._0x31d1f5
  };
  if (_0x329f44) {
    _0x3ea8d3.title = getLocalizedPresetTitle(_0x329f44);
  }
  if (Object.prototype.hasOwnProperty.call(_0x31d1f5, "desc")) {
    _0x3ea8d3.desc = getLocalizedPresetDesc(_0x329f44, _0x31d1f5.desc);
  }
  if (Array.isArray(_0x31d1f5.subItems)) {
    _0x3ea8d3.subItems = _0x31d1f5.subItems.map(localizePromptPresetItem);
  }
  if (Object.prototype.hasOwnProperty.call(_0x31d1f5, "template")) {
    _0x3ea8d3.template = localizePromptPresetTemplate(_0x31d1f5.template, _0x3732b3);
  }
  return _0x3ea8d3;
}
function localizePromptPresetItems(_0x2e6236 = []) {
  return (Array.isArray(_0x2e6236) ? _0x2e6236 : []).map(localizePromptPresetItem);
}
export const PROMPT_PRESETS = {
  "ai-image": [{
    icon: "📐",
    title: "场景参考",
    desc: "一键生成场景多视图和全景图",
    subItems: [{
      icon: "📐",
      title: "场景四视图",
      desc: "一键生成场景多视图",
      template: staticPromptTemplate(TEMPLATES.SceneReference)
    }, {
      icon: "▦",
      title: "场景九视图",
      desc: "同一场景的 9 个连续多视角设定图",
      template: staticPromptTemplate(TEMPLATES.SceneNineView)
    }, {
      icon: "🌐",
      title: "360°无缝全景图",
      desc: "生成适合 VR 查看的一张无缝 360° 全景图",
      template: TEMPLATES.Panorama360Seamless
    }]
  }, {
    icon: "🧍",
    title: "人设参考",
    desc: "一键生成人物多视图 三视图、三视图加脸部、人设拆解图",
    subItems: [{
      icon: "🧍",
      title: "人物三视图",
      desc: "纯正的三向视图展示",
      template: staticPromptTemplate(TEMPLATES.characterRef3View)
    }, {
      icon: "🧍",
      title: "人物三视图+脸部",
      desc: "带脸部特写的三视图",
      template: staticPromptTemplate(TEMPLATES.characterRef3ViewFace)
    }, {
      icon: "🧍",
      title: "前后视图+脸部",
      desc: "脸部特写与无头前后全身视图",
      template: staticPromptTemplate(TEMPLATES.characterFrontBackViewFace)
    }, {
      icon: "🧍",
      title: "人设解析图",
      desc: "包含细节拆解的设定集",
      template: staticPromptTemplate(TEMPLATES.characterRefAnalysis)
    }]
  }, {
    icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" width=\"14\" height=\"14\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect></svg>",
    title: "多宫格",
    desc: "一键生成剧情连续的多宫格图片",
    subItems: [{
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" width=\"14\" height=\"14\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect></svg>",
      title: "4宫格",
      desc: "起承转合更清晰，适合一句话剧情",
      template: staticPromptTemplate(TEMPLATES.multiGrid4)
    }, {
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" width=\"14\" height=\"14\"><rect x=\"3\" y=\"3\" width=\"4\" height=\"4\"></rect><rect x=\"10\" y=\"3\" width=\"4\" height=\"4\"></rect><rect x=\"17\" y=\"3\" width=\"4\" height=\"4\"></rect><rect x=\"3\" y=\"10\" width=\"4\" height=\"4\"></rect><rect x=\"10\" y=\"10\" width=\"4\" height=\"4\"></rect><rect x=\"17\" y=\"10\" width=\"4\" height=\"4\"></rect><rect x=\"3\" y=\"17\" width=\"4\" height=\"4\"></rect><rect x=\"10\" y=\"17\" width=\"4\" height=\"4\"></rect><rect x=\"17\" y=\"17\" width=\"4\" height=\"4\"></rect></svg>",
      title: "9宫格",
      desc: "3x3 更细动作与情绪递进",
      template: staticPromptTemplate(TEMPLATES.multiGrid9)
    }, {
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" width=\"14\" height=\"14\"><path d=\"M3 3h18v18H3z\"></path><path d=\"M7.5 3v18\"></path><path d=\"M12 3v18\"></path><path d=\"M16.5 3v18\"></path><path d=\"M3 7.5h18\"></path><path d=\"M3 12h18\"></path><path d=\"M3 16.5h18\"></path></svg>",
      title: "16宫格",
      desc: "4x4 更密的节奏推进与镜头切换",
      template: staticPromptTemplate(TEMPLATES.multiGrid16)
    }, {
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" width=\"14\" height=\"14\"><path d=\"M3 3h18v18H3z\"></path><path d=\"M6.6 3v18\"></path><path d=\"M10.2 3v18\"></path><path d=\"M13.8 3v18\"></path><path d=\"M17.4 3v18\"></path><path d=\"M3 6.6h18\"></path><path d=\"M3 10.2h18\"></path><path d=\"M3 13.8h18\"></path><path d=\"M3 17.4h18\"></path></svg>",
      title: "25宫格",
      desc: "5x5 长连续剧情，适合完整片段",
      template: staticPromptTemplate(TEMPLATES.multiGrid25)
    }]
  }, {
    icon: "🎬",
    title: "故事板分镜",
    desc: "一键生成故事板分镜",
    subItems: [{
      icon: "🎬",
      title: "竖版故事分镜",
      desc: "竖版分镜，从上到下推进",
      template: staticPromptTemplate(TEMPLATES.storyboardVertical)
    }, {
      icon: "🎬",
      title: "竖版故事分镜+场景",
      desc: "竖版分镜，包含场景设定参考",
      template: staticPromptTemplate(TEMPLATES.storyboardVerticalScene)
    }, {
      icon: "🎬",
      title: "横版故事分镜",
      desc: "横版分镜，从左到右推进",
      template: staticPromptTemplate(TEMPLATES.storyboardHorizontal)
    }, {
      icon: "🎬",
      title: "横版故事分镜+场景",
      desc: "横版分镜，包含场景设定参考",
      template: staticPromptTemplate(TEMPLATES.storyboardHorizontalScene)
    }, ...STORYBOARD_INSERT_PROMPT_PRESETS.map(storyboardInsertPromptPreset)]
  }],
  "ai-text": [{
    icon: "🖼️",
    title: REVERSE_IMAGE_PROMPT_PRESET_TITLE,
    desc: "根据参考图反推出中英文生图提示词",
    triggerMode: PROMPT_PRESET_TRIGGER_MODE_DIRECT,
    template: REVERSE_IMAGE_PROMPT_PRESET_PROMPT
  }, {
    icon: "📝",
    title: "长篇精缩V1",
    desc: "一键把长篇内容精缩成短篇",
    template: TEMPLATES.longToShort
  }, {
    icon: "📝",
    title: "提取人物场景道具信息",
    desc: "提取文本中的人物、场景、道具信息",
    template: TEMPLATES.extractInfo
  }, {
    icon: "🧍",
    title: "格式化短剧提示词",
    desc: "将小说一键转化为标准AI视频提示词脚本",
    subItems: [{
      icon: "📝",
      title: "影视级叙事分镜脚本",
      desc: "将小说一键转化为标准戏剧化脚本，专为AI短剧视频量身定制",
      template: TEMPLATES.Storyboard1
    }, {
      icon: "📝",
      title: "影视级叙事分镜脚本-秒级",
      desc: "精确到秒的光影渲染、运镜与音效控制，专为AI短剧视频量身定制",
      template: TEMPLATES.Storyboard2
    }, {
      icon: "🎬",
      title: "Seedance2.0视频格式",
      desc: "按用户秒数或默认15秒输出 Seedance 2.0 秒级视频提示词",
      template: TEMPLATES.Seedance2VideoFormat
    }]
  }],
  "ai-video": [{
    icon: "🎬",
    title: "Minimax H3",
    desc: "人物替换提示词预设",
    subItems: [{
      icon: "🧍",
      title: "完整人物替换",
      desc: "完整替换人物外貌与穿搭",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_FULL_CHARACTER_REPLACEMENT_PROMPT
    }, {
      icon: "🧍",
      title: "通用人物替换",
      desc: "通用人物身份与动作继承提示词",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_GENERAL_CHARACTER_REPLACEMENT_PROMPT
    }, {
      icon: "🔄",
      title: "万能换物提示词",
      desc: "局部替换指定物体并保持场景",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_UNIVERSAL_OBJECT_REPLACEMENT_PROMPT
    }, {
      icon: "🥤",
      title: "手持物品替换",
      desc: "替换手中物品并保持自然握持",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_HANDHELD_ITEM_REPLACEMENT_PROMPT
    }, {
      icon: "🚙",
      title: "车辆替换",
      desc: "替换行驶车辆并保持物理运动",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_VEHICLE_REPLACEMENT_PROMPT
    }, {
      icon: "👥",
      title: "多人替换",
      desc: "同步替换两名指定人物",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_MULTI_PERSON_REPLACEMENT_PROMPT
    }, {
      icon: "👕",
      title: "仅衣服替换",
      desc: "只替换主要人物服装",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_CLOTHING_ONLY_REPLACEMENT_PROMPT
    }, {
      icon: "💇",
      title: "衣服+发型替换",
      desc: "只替换主要人物服装与发型",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_CLOTHING_AND_HAIRSTYLE_REPLACEMENT_PROMPT
    }, {
      icon: "👤",
      title: "双人替换其中一个",
      desc: "只替换画面左侧指定人物",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT,
      template: MINIMAX_H3_REPLACE_ONE_OF_TWO_PEOPLE_PROMPT
    }]
  }]
};
let customPresets = {};
const SUPPORTED_PRESET_NODE_TYPES = new Set(["ai-image", "ai-text", "ai-video", "ai-audio", "storyboard-script"]);
const PRESET_MANAGER_TABS = [{
  nodeType: "ai-text",
  label: "文本预设",
  desc: "管理 文本节点 的生成预设",
  icon: "text"
}, {
  nodeType: "ai-image",
  label: "图像预设",
  desc: "管理 图像节点 的生成预设",
  icon: "image"
}, {
  nodeType: "ai-video",
  label: "视频预设",
  desc: "管理 视频节点 的生成预设",
  icon: "video"
}, {
  nodeType: "ai-audio",
  label: "音频预设",
  desc: "管理 音频节点 的生成预设",
  icon: "audio"
}, {
  nodeType: "storyboard-script",
  label: "分镜脚本预设",
  desc: "管理 分镜脚本节点 的生成预设",
  icon: "text"
}];
const USER_INPUT_PLACEHOLDER = PROMPT_PRESET_USER_INPUT_PLACEHOLDER;
const NODE_TYPE_I18N_KEYS = Object.freeze({
  "ai-image": "image",
  "ai-text": "text",
  "ai-video": "video",
  "ai-audio": "audio",
  "storyboard-script": "storyboardScript"
});
const PROMPT_PRESET_TITLE_I18N_KEYS = Object.freeze({
  场景参考: "sceneReferenceGroup",
  场景四视图: "sceneFourView",
  场景九视图: "sceneNineView",
  "360°无缝全景图": "panorama360",
  人设参考: "characterReferenceGroup",
  人物三视图: "characterThreeView",
  "人物三视图+脸部": "characterThreeViewFace",
  "前后视图+脸部": "characterFrontBackViewFace",
  人设解析图: "characterAnalysis",
  多宫格: "multiGridGroup",
  "4宫格": "multiGrid4",
  "9宫格": "multiGrid9",
  "16宫格": "multiGrid16",
  "25宫格": "multiGrid25",
  故事板分镜: "storyboardGroup",
  竖版故事分镜: "storyboardVertical",
  "竖版故事分镜+场景": "storyboardVerticalScene",
  横版故事分镜: "storyboardHorizontal",
  "横版故事分镜+场景": "storyboardHorizontalScene",
  电影分镜故事板: "filmStoryboard",
  广告故事板: "advertisingStoryboard",
  游戏剧情故事板: "gameStoryStoryboard",
  体育训练故事板: "sportsTrainingStoryboard",
  动画故事板: "animationStoryboard",
  MV音乐视频故事板: "musicVideoStoryboard",
  漫画分镜页: "comicStoryboardPage",
  社交媒体短视频分镜: "socialShortVideoStoryboard",
  品牌宣传故事版: "brandPromotionStoryboard",
  教程类分镜图: "tutorialStoryboard",
  高清电影制作板: "hdFilmProductionBoard",
  修仙国漫故事板: "xianxiaGuomanStoryboard",
  [REVERSE_IMAGE_PROMPT_PRESET_TITLE]: "reverseImagePrompt",
  长篇精缩V1: "longToShort",
  提取人物场景道具信息: "extractInfo",
  格式化短剧提示词: "formatShortDrama",
  影视级叙事分镜脚本: "storyboardScript",
  "影视级叙事分镜脚本-秒级": "storyboardScriptTimed",
  "Seedance2.0视频格式": "seedance2VideoFormat",
  "Minimax H3": "minimaxH3Group",
  完整人物替换: "minimaxH3FullCharacterReplacement",
  通用人物替换: "minimaxH3GeneralCharacterReplacement",
  万能换物提示词: "minimaxH3UniversalObjectReplacement",
  手持物品替换: "minimaxH3HandheldItemReplacement",
  车辆替换: "minimaxH3VehicleReplacement",
  多人替换: "minimaxH3MultiPersonReplacement",
  仅衣服替换: "minimaxH3ClothingOnlyReplacement",
  "衣服+发型替换": "minimaxH3ClothingAndHairstyleReplacement",
  双人替换其中一个: "minimaxH3ReplaceOneOfTwoPeople"
});
function getPresetNodeTypeLabel(_0x33acde) {
  const _0x2964e8 = NODE_TYPE_I18N_KEYS[_0x33acde];
  if (_0x2964e8) {
    return promptPresetsText("nodeTypes." + _0x2964e8);
  } else {
    return promptPresetsText("nodeTypes.node");
  }
}
function getPresetManagerTabLabel(_0x3af0f8) {
  const _0x200e31 = NODE_TYPE_I18N_KEYS[_0x3af0f8?.nodeType];
  if (_0x200e31) {
    return promptPresetsText("tabs." + _0x200e31 + ".label");
  } else {
    return String(_0x3af0f8?.label || "");
  }
}
function getPresetManagerDesc(_0x283f8a) {
  return promptPresetsText("manager.desc", {
    nodeType: getPresetNodeTypeLabel(_0x283f8a)
  });
}
function getUserInputPillHtml() {
  return "<span class=\"preset-placeholder-pill\" contenteditable=\"false\" data-preset-placeholder=\"user-input\">" + escapePresetTemplateHtml(promptPresetsText("userInputPill")) + "</span>";
}
function getPresetTemplatePlaceholderText() {
  return promptPresetsText("templatePlaceholder");
}
function getCustomPresetFallbackTitle() {
  return promptPresetsText("customPresetFallback");
}
function getLocalizedPresetTitle(_0x563f5b) {
  const _0x2fa6e7 = PROMPT_PRESET_TITLE_I18N_KEYS[_0x563f5b];
  if (_0x2fa6e7) {
    return promptPresetsText("presets." + _0x2fa6e7 + ".title");
  } else {
    return _0x563f5b;
  }
}
function getLocalizedPresetDesc(_0x5ea428, _0x8a8ca9) {
  const _0x4ab7f9 = PROMPT_PRESET_TITLE_I18N_KEYS[_0x5ea428];
  if (_0x4ab7f9) {
    return promptPresetsText("presets." + _0x4ab7f9 + ".desc");
  } else {
    return _0x8a8ca9;
  }
}
export function normalizePromptPresetTriggerMode(_0x201d9b) {
  const _0x308fd6 = String(_0x201d9b || "").trim();
  if (PROMPT_PRESET_TRIGGER_MODES.has(_0x308fd6)) {
    return _0x308fd6;
  } else {
    return PROMPT_PRESET_TRIGGER_MODE_DIRECT;
  }
}
export function shouldInsertPromptForPreset(_0x531f95 = {}) {
  return normalizePromptPresetTriggerMode(_0x531f95?.triggerMode) === PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT;
}
export function isPromptPresetNodeTypeSupported(_0x5b7eea) {
  return SUPPORTED_PRESET_NODE_TYPES.has(String(_0x5b7eea || "").trim());
}
function getPromptPresetTriggerModeLabel(_0x1423b0 = {}) {
  if (shouldInsertPromptForPreset(_0x1423b0)) {
    return promptPresetsText("triggerModes.insertPrompt");
  } else {
    return promptPresetsText("triggerModes.direct");
  }
}
export async function loadCustomPresets() {
  try {
    customPresets = await fetchPromptPresetsFromServer();
  } catch (_0x121ef0) {
    console.warn("[promptPresets] No custom presets found or load failed.", _0x121ef0);
  }
}
export function getPromptPresets(_0x17562f) {
  const _0x298835 = PROMPT_PRESETS[_0x17562f] || [];
  const _0x5cfd02 = customPresets[_0x17562f] || [];
  return [...localizePromptPresetItems(_0x298835), ..._0x5cfd02];
}
function normalizePresetNodeType(_0x27553d) {
  const _0x55748b = String(_0x27553d || "").trim();
  if (SUPPORTED_PRESET_NODE_TYPES.has(_0x55748b)) {
    return _0x55748b;
  } else {
    return "ai-image";
  }
}
function normalizePresetManagerNodeType(_0x32c24b) {
  const _0x49b87d = String(_0x32c24b || "").trim();
  if (PRESET_MANAGER_TABS.some(_0xdc934e => _0xdc934e.nodeType === _0x49b87d)) {
    return _0x49b87d;
  } else {
    return "ai-text";
  }
}
export function getCustomPromptPresets(_0x531fa9) {
  const _0x1d631e = normalizePresetNodeType(_0x531fa9);
  if (Array.isArray(customPresets[_0x1d631e])) {
    return [...customPresets[_0x1d631e]];
  } else {
    return [];
  }
}
export function getSlashPromptPresetEntries(_0x4cf8d2) {
  const _0x378c50 = PROMPT_PRESETS[_0x4cf8d2] || [];
  const _0x2a650a = getCustomPromptPresets(_0x4cf8d2);
  const _0x5d11fa = localizePromptPresetItems(_0x378c50);
  if (_0x2a650a.length === 0) {
    return _0x5d11fa;
  }
  return [..._0x5d11fa, {
    title: promptPresetsText("customGroupTitle"),
    desc: promptPresetsText("customGroupDesc"),
    subItems: _0x2a650a
  }];
}
export function __setCustomPromptPresetsForTest(_0x3770a4 = {}) {
  customPresets = _0x3770a4 && typeof _0x3770a4 === "object" ? {
    ..._0x3770a4
  } : {};
}
function escapePresetTemplateHtml(_0x43b201) {
  return String(_0x43b201 ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
export function renderPresetTemplateEditorHtml(_0x5bf5b4 = "") {
  return String(_0x5bf5b4 ?? "").split(USER_INPUT_PLACEHOLDER).map(_0x1c3b1f => escapePresetTemplateHtml(_0x1c3b1f).replace(/\r?\n/g, "<br>")).join(getUserInputPillHtml());
}
export function serializePresetTemplateEditorHtml(_0x2eed42 = "") {
  const _0x1918f9 = "__AIC_USER_INPUT_PLACEHOLDER__";
  const _0x3c4072 = String(_0x2eed42 ?? "").replace(/<span\b[^>]*\bdata-preset-placeholder=["']user-input["'][^>]*>[\s\S]*?<\/span>/gi, _0x1918f9).replace(/<br\b[^>]*\/?>/gi, "\n").replace(/<\/(div|p)>/gi, "\n").replace(/<[^>]+>/g, "");
  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    return _0x3c4072.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(new RegExp(_0x1918f9, "g"), USER_INPUT_PLACEHOLDER).replace(/\n{3,}/g, "\n\n").trim();
  }
  const _0x6f1d88 = document.createElement("textarea");
  _0x6f1d88.innerHTML = _0x3c4072;
  return _0x6f1d88.value.replace(new RegExp(_0x1918f9, "g"), USER_INPUT_PLACEHOLDER).replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
function editorHasUserInputPill(_0x46560e) {
  return !!_0x46560e?.querySelector?.("[data-preset-placeholder=\"user-input\"]");
}
function moveCaretAfterNode(_0xfb7046) {
  const _0x4c61a4 = window.getSelection?.();
  if (!_0x4c61a4) {
    return;
  }
  const _0x12b19e = document.createRange();
  _0x12b19e.setStartAfter(_0xfb7046);
  _0x12b19e.collapse(true);
  _0x4c61a4.removeAllRanges();
  _0x4c61a4.addRange(_0x12b19e);
}
function insertUserInputPill(_0x3c11cf) {
  if (editorHasUserInputPill(_0x3c11cf)) {
    showPresetManagerToast(promptPresetsText("editor.duplicateUserInput"), "warn");
    return false;
  }
  const _0x21894b = document.createElement("span");
  _0x21894b.innerHTML = getUserInputPillHtml();
  const _0x4279dc = _0x21894b.firstElementChild;
  const _0x36471b = document.createTextNode(" ");
  const _0x1d6002 = window.getSelection?.();
  const _0x3196c0 = _0x1d6002?.rangeCount && _0x3c11cf.contains(_0x1d6002.getRangeAt(0).commonAncestorContainer) ? _0x1d6002.getRangeAt(0) : null;
  if (_0x3196c0) {
    _0x3196c0.deleteContents();
    _0x3196c0.insertNode(_0x36471b);
    _0x3196c0.insertNode(_0x4279dc);
  } else {
    _0x3c11cf.appendChild(_0x4279dc);
    _0x3c11cf.appendChild(_0x36471b);
  }
  moveCaretAfterNode(_0x36471b);
  _0x3c11cf.focus();
  return true;
}
function buildPresetModalButton(_0x23d6e8, _0x35a8a5) {
  const _0x52427c = document.createElement("button");
  _0x52427c.type = "button";
  _0x52427c.className = _0x35a8a5;
  _0x52427c.textContent = _0x23d6e8;
  return _0x52427c;
}
function buildPresetTriggerModeControl(_0x1fb6d5) {
  let _0x1aabe0 = normalizePromptPresetTriggerMode(_0x1fb6d5);
  const _0x3322dd = document.createElement("div");
  _0x3322dd.className = "preset-manager-trigger-modes";
  _0x3322dd.setAttribute("role", "group");
  _0x3322dd.setAttribute("aria-label", promptPresetsText("triggerModes.aria"));
  const _0x3b8b7b = document.createElement("span");
  _0x3b8b7b.className = "preset-manager-trigger-mode-label";
  _0x3b8b7b.textContent = promptPresetsText("triggerModes.label");
  _0x3322dd.appendChild(_0x3b8b7b);
  const _0x5242f6 = (_0x4cada5, _0x3ebaed) => {
    const _0x12e2fd = buildPresetModalButton(_0x3ebaed, "preset-manager-trigger-mode");
    _0x12e2fd.dataset.triggerMode = _0x4cada5;
    _0x12e2fd.setAttribute("aria-pressed", "false");
    _0x12e2fd.addEventListener("click", () => {
      _0x1aabe0 = _0x4cada5;
      _0xc18011();
    });
    _0x3322dd.appendChild(_0x12e2fd);
    return _0x12e2fd;
  };
  const _0x252ea5 = _0x5242f6(PROMPT_PRESET_TRIGGER_MODE_DIRECT, promptPresetsText("triggerModes.direct"));
  const _0x19881d = _0x5242f6(PROMPT_PRESET_TRIGGER_MODE_INSERT_PROMPT, promptPresetsText("triggerModes.insertPrompt"));
  function _0xc18011() {
    [_0x252ea5, _0x19881d].forEach(_0x43c35f => {
      const _0x570cfb = _0x43c35f.dataset.triggerMode === _0x1aabe0;
      _0x43c35f.classList.toggle("is-active", _0x570cfb);
      _0x43c35f.setAttribute("aria-pressed", _0x570cfb ? "true" : "false");
    });
  }
  _0xc18011();
  return {
    element: _0x3322dd,
    getValue: () => _0x1aabe0
  };
}
function buildPresetManagerIcon(_0x3ebf28) {
  const _0x19a85c = document.createElement("span");
  _0x19a85c.className = "preset-manager-list-icon preset-manager-list-icon--" + _0x3ebf28;
  _0x19a85c.setAttribute("aria-hidden", "true");
  return _0x19a85c;
}
export function getPromptPresetThumbSrc(_0x23d1eb) {
  const _0x398bb2 = String(_0x23d1eb?.thumbnailDataUrl || "").trim();
  if (_0x398bb2) {
    return _0x398bb2;
  }
  const _0x3b2abf = String(_0x23d1eb?.thumbUrl || _0x23d1eb?.thumbnailUrl || _0x23d1eb?.posterUrl || _0x23d1eb?.coverUrl || "").trim();
  if (_0x3b2abf) {
    return _0x3b2abf;
  }
  const _0xb9d982 = String(_0x23d1eb?.thumbLocalPath || _0x23d1eb?.thumbnailLocalPath || _0x23d1eb?.posterLocalPath || _0x23d1eb?.coverLocalPath || "").trim();
  if (_0xb9d982) {
    return "/" + _0xb9d982.replace(/^\/+/, "");
  } else {
    return "";
  }
}
function readPresetThumbnailFile(_0x133eae) {
  return new Promise((_0x14e8ad, _0x54d84b) => {
    if (!_0x133eae || !String(_0x133eae.type || "").startsWith("image/")) {
      _0x54d84b(new Error(promptPresetsText("thumbnail.chooseImage")));
      return;
    }
    const _0x58810f = new FileReader();
    _0x58810f.onload = () => _0x14e8ad(String(_0x58810f.result || ""));
    _0x58810f.onerror = () => _0x54d84b(new Error(promptPresetsText("thumbnail.readFailed")));
    _0x58810f.readAsDataURL(_0x133eae);
  });
}
function buildPresetThumbnailControl({
  preset: _0x2c9b70,
  onUpload: _0x242e52
}) {
  const _0x4d194c = document.createElement("label");
  _0x4d194c.className = "preset-manager-list-thumb";
  _0x4d194c.title = promptPresetsText("thumbnail.upload");
  _0x4d194c.addEventListener("click", _0x235302 => _0x235302.stopPropagation());
  const _0x250eff = getPromptPresetThumbSrc(_0x2c9b70);
  if (_0x250eff) {
    const _0x4a84bd = document.createElement("img");
    _0x4a84bd.className = "preset-manager-list-thumb-img";
    _0x4a84bd.src = _0x250eff;
    _0x4a84bd.alt = "";
    _0x4d194c.appendChild(_0x4a84bd);
  } else {
    const _0x5b1b5f = document.createElement("span");
    _0x5b1b5f.className = "preset-manager-list-thumb-plus";
    _0x5b1b5f.textContent = "+";
    _0x4d194c.appendChild(_0x5b1b5f);
  }
  const _0x31a1d5 = document.createElement("input");
  _0x31a1d5.className = "preset-manager-thumb-input";
  _0x31a1d5.type = "file";
  _0x31a1d5.accept = "image/*";
  _0x31a1d5.addEventListener("click", _0x6f568d => _0x6f568d.stopPropagation());
  _0x31a1d5.addEventListener("change", async () => {
    const _0x347445 = _0x31a1d5.files?.[0];
    if (!_0x347445) {
      return;
    }
    try {
      const _0x856de5 = await readPresetThumbnailFile(_0x347445);
      _0x242e52?.(_0x856de5);
    } catch (_0x19a25f) {
      showPresetManagerToast(_0x19a25f?.message || promptPresetsText("thumbnail.uploadFailed"), "error");
    } finally {
      _0x31a1d5.value = "";
    }
  });
  _0x4d194c.appendChild(_0x31a1d5);
  return _0x4d194c;
}
function buildPresetEditorPlaceholder() {
  const _0x47fed0 = document.createElement("div");
  _0x47fed0.className = "preset-manager-editor-placeholder";
  _0x47fed0.setAttribute("aria-hidden", "true");
  _0x47fed0.appendChild(document.createTextNode(getPresetTemplatePlaceholderText() + " "));
  const _0x2f2266 = document.createElement("span");
  _0x2f2266.innerHTML = getUserInputPillHtml();
  _0x47fed0.appendChild(_0x2f2266.firstElementChild);
  return _0x47fed0;
}
function isPresetTemplateEditorEmpty(_0x3975a3) {
  return !serializePresetTemplateEditorHtml(_0x3975a3?.innerHTML || "");
}
function syncPresetEditorPlaceholder(_0x82801d, _0xb36bca) {
  _0xb36bca.hidden = !isPresetTemplateEditorEmpty(_0x82801d);
}
function buildPresetManagerTabIcon(_0xc8ae97) {
  const _0x3262f1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  _0x3262f1.setAttribute("class", "preset-manager-tab-icon");
  _0x3262f1.setAttribute("width", "16");
  _0x3262f1.setAttribute("height", "16");
  _0x3262f1.setAttribute("viewBox", "0 0 24 24");
  _0x3262f1.setAttribute("fill", "none");
  _0x3262f1.setAttribute("stroke", "currentColor");
  _0x3262f1.setAttribute("stroke-width", "2");
  _0x3262f1.setAttribute("aria-hidden", "true");
  const _0x4ef47d = (_0x5b2aef, _0x2f58ce) => {
    const _0xc6409d = document.createElementNS("http://www.w3.org/2000/svg", _0x5b2aef);
    Object.entries(_0x2f58ce).forEach(([_0x23065a, _0x3e967f]) => _0xc6409d.setAttribute(_0x23065a, _0x3e967f));
    _0x3262f1.appendChild(_0xc6409d);
  };
  if (_0xc8ae97 === "text") {
    _0x4ef47d("polyline", {
      points: "4 7 4 4 20 4 20 7"
    });
    _0x4ef47d("line", {
      x1: "9",
      y1: "20",
      x2: "15",
      y2: "20"
    });
    _0x4ef47d("line", {
      x1: "12",
      y1: "4",
      x2: "12",
      y2: "20"
    });
    return _0x3262f1;
  }
  if (_0xc8ae97 === "image") {
    _0x4ef47d("rect", {
      x: "3",
      y: "3",
      width: "18",
      height: "18",
      rx: "2"
    });
    _0x4ef47d("circle", {
      cx: "8.5",
      cy: "8.5",
      r: "1.5"
    });
    _0x4ef47d("polyline", {
      points: "21 15 16 10 5 21"
    });
    return _0x3262f1;
  }
  if (_0xc8ae97 === "video") {
    _0x4ef47d("polygon", {
      points: "23 7 16 12 23 17 23 7"
    });
    _0x4ef47d("rect", {
      x: "1",
      y: "5",
      width: "15",
      height: "14",
      rx: "2"
    });
    return _0x3262f1;
  }
  if (_0xc8ae97 === "audio") {
    _0x4ef47d("path", {
      d: "M9 18V5l12-2v13"
    });
    _0x4ef47d("circle", {
      cx: "6",
      cy: "18",
      r: "3"
    });
    _0x4ef47d("circle", {
      cx: "18",
      cy: "16",
      r: "3"
    });
    return _0x3262f1;
  }
  return _0x3262f1;
}
function getUniqueDraftTitle(_0x254f24) {
  const _0x1bdcd5 = new Set((_0x254f24 || []).map(_0x442ea0 => String(_0x442ea0?.title || "").trim()));
  let _0x2a3a7f = 1;
  let _0x43f192 = getCustomPresetFallbackTitle();
  while (_0x1bdcd5.has(_0x43f192)) {
    _0x2a3a7f += 1;
    _0x43f192 = promptPresetsText("customPresetFallbackWithIndex", {
      index: _0x2a3a7f
    });
  }
  return _0x43f192;
}
function showPresetManagerToast(_0x39a7ea, _0x5a5b55 = "info") {
  window.showToast?.(_0x39a7ea, _0x5a5b55);
}
function createPresetEditor({
  nodeType: _0x27b4f2,
  preset = null,
  isDraft = false,
  onSaved: _0x553904
}) {
  const _0x316944 = document.createElement("div");
  _0x316944.className = "preset-manager-detail";
  const _0x2c5b59 = isDraft ? "" : String(preset?.title || "").trim();
  const _0x11e0ba = String(preset?.title || "").trim();
  const _0x372b91 = document.createElement("label");
  _0x372b91.className = "preset-manager-field";
  const _0x204cf4 = document.createElement("span");
  _0x204cf4.className = "preset-manager-label";
  _0x204cf4.textContent = promptPresetsText("editor.name");
  const _0xe70ab8 = document.createElement("input");
  _0xe70ab8.className = "preset-manager-input";
  _0xe70ab8.type = "text";
  _0xe70ab8.placeholder = promptPresetsText("editor.namePlaceholder");
  _0xe70ab8.value = _0x11e0ba;
  _0x372b91.appendChild(_0x204cf4);
  _0x372b91.appendChild(_0xe70ab8);
  const _0x418eb5 = document.createElement("label");
  _0x418eb5.className = "preset-manager-field";
  const _0x4db900 = document.createElement("span");
  _0x4db900.className = "preset-manager-label";
  _0x4db900.textContent = promptPresetsText("editor.desc");
  const _0x468659 = document.createElement("input");
  _0x468659.className = "preset-manager-input";
  _0x468659.type = "text";
  _0x468659.placeholder = promptPresetsText("editor.descPlaceholder");
  _0x468659.value = String(preset?.desc || "").trim();
  _0x418eb5.appendChild(_0x4db900);
  _0x418eb5.appendChild(_0x468659);
  const _0x39f464 = document.createElement("div");
  _0x39f464.className = "preset-manager-template-tools";
  const _0x10101a = document.createElement("span");
  _0x10101a.className = "preset-manager-label";
  _0x10101a.textContent = promptPresetsText("editor.template");
  const _0x373aab = buildPresetModalButton(promptPresetsText("editor.insertPrompt"), "preset-modal-btn-secondary preset-manager-insert-btn");
  _0x39f464.appendChild(_0x10101a);
  _0x39f464.appendChild(_0x373aab);
  const _0x5a7f46 = document.createElement("div");
  _0x5a7f46.className = "preset-manager-editor-wrap";
  const _0x21381e = document.createElement("div");
  _0x21381e.className = "preset-manager-textarea preset-manager-editor";
  _0x21381e.contentEditable = "true";
  _0x21381e.spellcheck = false;
  _0x21381e.innerHTML = renderPresetTemplateEditorHtml(preset?.template || "");
  _0x373aab.addEventListener("click", () => insertUserInputPill(_0x21381e));
  const _0x407445 = buildPresetEditorPlaceholder();
  _0x21381e.addEventListener("input", () => syncPresetEditorPlaceholder(_0x21381e, _0x407445));
  _0x21381e.addEventListener("blur", () => syncPresetEditorPlaceholder(_0x21381e, _0x407445));
  _0x5a7f46.addEventListener("click", () => {
    _0x21381e.focus();
  });
  _0x5a7f46.appendChild(_0x21381e);
  _0x5a7f46.appendChild(_0x407445);
  syncPresetEditorPlaceholder(_0x21381e, _0x407445);
  const _0x1952b7 = buildPresetTriggerModeControl(preset?.triggerMode);
  const _0x5e3f8e = buildPresetModalButton(promptPresetsText("editor.save"), "preset-modal-btn-primary");
  _0x5e3f8e.addEventListener("click", async () => {
    const _0x488e48 = _0xe70ab8.value.trim();
    const _0x5da1a1 = serializePresetTemplateEditorHtml(_0x21381e.innerHTML);
    if (!_0x488e48) {
      showPresetManagerToast(promptPresetsText("editor.titleRequired"), "warn");
      _0xe70ab8.focus();
      return;
    }
    if (!_0x5da1a1) {
      showPresetManagerToast(promptPresetsText("editor.templateRequired"), "warn");
      _0x21381e.focus();
      return;
    }
    _0x5e3f8e.disabled = true;
    _0x5e3f8e.textContent = promptPresetsText("editor.saving");
    try {
      await savePromptPresetToServer({
        nodeType: _0x27b4f2,
        title: _0x488e48,
        desc: _0x468659.value.trim(),
        template: _0x5da1a1,
        triggerMode: _0x1952b7.getValue(),
        thumbnailDataUrl: String(preset?.thumbnailDataUrl || "").trim(),
        thumbLocalPath: String(preset?.thumbLocalPath || "").trim(),
        originalTitle: _0x2c5b59,
        installId: String(window.__aicInstallId || globalThis.__aicInstallId || "").trim()
      });
      await loadCustomPresets();
      showPresetManagerToast(promptPresetsText("editor.saved"), "success");
      _0x553904?.({
        title: _0x488e48
      });
    } catch (_0x3c29d0) {
      showPresetManagerToast(_0x3c29d0?.message || promptPresetsText("editor.saveFailed"), "error");
    } finally {
      _0x5e3f8e.disabled = false;
      _0x5e3f8e.textContent = promptPresetsText("editor.save");
    }
  });
  _0x316944.appendChild(_0x372b91);
  _0x316944.appendChild(_0x418eb5);
  _0x316944.appendChild(_0x39f464);
  _0x316944.appendChild(_0x5a7f46);
  return {
    element: _0x316944,
    triggerModeControl: _0x1952b7.element,
    saveButton: _0x5e3f8e
  };
}
export function openCustomPresetsManager({
  nodeType: _0x4a89db,
  sourceNodeId = ""
} = {}) {
  let _0xdd346e = normalizePresetManagerNodeType(_0x4a89db);
  const _0x408cc1 = String(sourceNodeId || "").trim();
  const _0x1dedf8 = document.createElement("div");
  _0x1dedf8.className = "preset-modal-overlay";
  const _0x45b4b9 = document.createElement("div");
  _0x45b4b9.className = "preset-modal preset-modal--manager";
  _0x45b4b9.addEventListener("click", _0x16f888 => _0x16f888.stopPropagation());
  const _0x2bf424 = document.createElement("div");
  _0x2bf424.className = "preset-manager-title-row";
  const _0x4d6a1f = document.createElement("div");
  _0x4d6a1f.className = "preset-manager-title-group";
  const _0x31ef9f = document.createElement("div");
  _0x31ef9f.textContent = promptPresetsText("manager.title");
  _0x31ef9f.className = "preset-modal-title";
  const _0x42b503 = document.createElement("div");
  _0x42b503.className = "preset-modal-desc";
  _0x42b503.textContent = getPresetManagerDesc(_0xdd346e);
  _0x4d6a1f.appendChild(_0x31ef9f);
  _0x4d6a1f.appendChild(_0x42b503);
  const _0x15818f = buildPresetModalButton("×", "preset-manager-close-btn");
  _0x15818f.setAttribute("aria-label", promptPresetsText("manager.close"));
  _0x15818f.addEventListener("click", () => _0x1dedf8.remove());
  _0x2bf424.appendChild(_0x4d6a1f);
  _0x2bf424.appendChild(_0x15818f);
  const _0x41be2a = document.createElement("div");
  _0x41be2a.className = "preset-manager-tabs";
  _0x41be2a.setAttribute("role", "tablist");
  const _0x540cc1 = new Map();
  PRESET_MANAGER_TABS.forEach(_0x4f7318 => {
    const _0x5276d3 = buildPresetModalButton("", "preset-manager-tab");
    _0x5276d3.setAttribute("role", "tab");
    _0x5276d3.appendChild(buildPresetManagerTabIcon(_0x4f7318.icon));
    const _0x24fa63 = document.createElement("span");
    _0x24fa63.textContent = getPresetManagerTabLabel(_0x4f7318);
    _0x5276d3.appendChild(_0x24fa63);
    _0x5276d3.addEventListener("click", () => {
      _0xdd346e = _0x4f7318.nodeType;
      _0x1a1508();
    });
    _0x540cc1.set(_0x4f7318.nodeType, _0x5276d3);
    _0x41be2a.appendChild(_0x5276d3);
  });
  const _0x1a7899 = document.createElement("div");
  _0x1a7899.className = "preset-manager-shell";
  const _0x1fb9da = document.createElement("div");
  _0x1fb9da.className = "preset-manager-sidebar";
  const _0x3dd33d = buildPresetModalButton(promptPresetsText("manager.new"), "preset-manager-new-btn");
  const _0x381c7a = document.createElement("div");
  _0x381c7a.className = "preset-manager-list";
  _0x1fb9da.appendChild(_0x3dd33d);
  _0x1fb9da.appendChild(_0x381c7a);
  const _0x24e376 = document.createElement("div");
  _0x24e376.className = "preset-manager-detail-pane";
  _0x1a7899.appendChild(_0x1fb9da);
  _0x1a7899.appendChild(_0x24e376);
  const _0x13745f = document.createElement("div");
  _0x13745f.className = "preset-modal-actions";
  const _0x581223 = new Map(PRESET_MANAGER_TABS.map(_0x188295 => [_0x188295.nodeType, {
    selectedKey: "",
    draftPreset: null,
    draftCounter: 0
  }]));
  const _0xd5dc3b = _0x224fae => _0x581223.get(_0x224fae) || {
    selectedKey: "",
    draftPreset: null,
    draftCounter: 0
  };
  const _0x16af2e = _0xe547a5 => "saved:" + String(_0xe547a5?.title || "");
  const _0x30c17b = _0x53a1c2 => _0x53a1c2 ? "draft:" + _0x53a1c2.id : "";
  const _0x1a1508 = () => {
    _0x381c7a.replaceChildren();
    _0x24e376.replaceChildren();
    _0x13745f.replaceChildren();
    _0x42b503.textContent = getPresetManagerDesc(_0xdd346e);
    _0x540cc1.forEach((_0x46d8a5, _0x2ab869) => {
      const _0x469afb = _0x2ab869 === _0xdd346e;
      _0x46d8a5.classList.toggle("is-active", _0x469afb);
      _0x46d8a5.setAttribute("aria-selected", _0x469afb ? "true" : "false");
    });
    const _0x7ff36d = _0xd5dc3b(_0xdd346e);
    const _0x3f5e42 = getCustomPromptPresets(_0xdd346e);
    const _0x1b227c = [];
    if (_0x7ff36d.draftPreset) {
      _0x1b227c.push({
        key: _0x30c17b(_0x7ff36d.draftPreset),
        preset: _0x7ff36d.draftPreset,
        isDraft: true
      });
    }
    _0x3f5e42.forEach(_0x33e8e4 => {
      _0x1b227c.push({
        key: _0x16af2e(_0x33e8e4),
        preset: _0x33e8e4,
        isDraft: false
      });
    });
    if (!_0x7ff36d.selectedKey && _0x1b227c.length > 0) {
      _0x7ff36d.selectedKey = _0x1b227c[0].key;
    }
    if (_0x7ff36d.selectedKey && _0x1b227c.length > 0 && !_0x1b227c.some(_0x52043c => _0x52043c.key === _0x7ff36d.selectedKey)) {
      _0x7ff36d.selectedKey = _0x1b227c[0].key;
    }
    if (_0x1b227c.length === 0) {
      const _0xdcd9c3 = document.createElement("div");
      _0xdcd9c3.className = "preset-manager-empty";
      _0xdcd9c3.textContent = promptPresetsText("manager.emptyList");
      _0x381c7a.appendChild(_0xdcd9c3);
    }
    _0x1b227c.forEach(({
      key: _0x1e35ad,
      preset: _0x362c88,
      isDraft: _0x4efc27
    }) => {
      const _0x4a3a92 = document.createElement("div");
      _0x4a3a92.setAttribute("role", "button");
      _0x4a3a92.tabIndex = 0;
      _0x4a3a92.className = "preset-manager-list-item";
      _0x4a3a92.classList.toggle("is-active", _0x1e35ad === _0x7ff36d.selectedKey);
      _0x4a3a92.classList.toggle("has-trigger-badge", !_0x4efc27);
      _0x4a3a92.appendChild(buildPresetThumbnailControl({
        preset: _0x362c88,
        onUpload: _0x43e465 => {
          _0x362c88.thumbnailDataUrl = _0x43e465;
          _0x362c88.thumbLocalPath = "";
          _0x362c88.thumbUrl = "";
          _0x7ff36d.selectedKey = _0x1e35ad;
          showPresetManagerToast(promptPresetsText("thumbnail.updated"), "success");
          _0x1a1508();
        }
      }));
      const _0x4012b0 = document.createElement("span");
      _0x4012b0.className = "preset-manager-list-text";
      const _0x281229 = document.createElement("span");
      _0x281229.className = "preset-manager-list-title";
      _0x281229.textContent = _0x362c88?.title || getCustomPresetFallbackTitle();
      const _0x4dcc46 = document.createElement("span");
      _0x4dcc46.className = "preset-manager-list-desc";
      _0x4dcc46.textContent = _0x362c88?.desc || _0x362c88?.template || promptPresetsText("presetDescFallback");
      _0x4012b0.appendChild(_0x281229);
      _0x4012b0.appendChild(_0x4dcc46);
      _0x4a3a92.appendChild(_0x4012b0);
      if (!_0x4efc27) {
        const _0x2c6c94 = document.createElement("span");
        _0x2c6c94.className = "preset-manager-list-trigger-badge";
        _0x2c6c94.textContent = getPromptPresetTriggerModeLabel(_0x362c88);
        _0x4a3a92.appendChild(_0x2c6c94);
      }
      _0x4a3a92.addEventListener("click", () => {
        _0x7ff36d.selectedKey = _0x1e35ad;
        _0x1a1508();
      });
      _0x4a3a92.addEventListener("keydown", _0x5de7d7 => {
        if (_0x5de7d7.key !== "Enter" && _0x5de7d7.key !== " ") {
          return;
        }
        _0x5de7d7.preventDefault();
        _0x7ff36d.selectedKey = _0x1e35ad;
        _0x1a1508();
      });
      const _0x382c9e = buildPresetModalButton("×", "preset-manager-list-delete");
      _0x382c9e.setAttribute("aria-label", promptPresetsText("manager.deleteAria", {
        title: _0x362c88?.title || getCustomPresetFallbackTitle()
      }));
      _0x382c9e.addEventListener("click", async _0x8d6cd7 => {
        _0x8d6cd7.preventDefault();
        _0x8d6cd7.stopPropagation();
        _0x382c9e.disabled = true;
        if (_0x4efc27) {
          _0x7ff36d.draftPreset = null;
          if (_0x7ff36d.selectedKey === _0x1e35ad) {
            _0x7ff36d.selectedKey = "";
          }
          _0x1a1508();
          return;
        }
        try {
          await deletePromptPresetFromServer({
            nodeType: _0xdd346e,
            title: String(_0x362c88?.title || "")
          });
          await loadCustomPresets();
          showPresetManagerToast(promptPresetsText("delete.deleted"), "success");
          if (_0x7ff36d.selectedKey === _0x1e35ad) {
            _0x7ff36d.selectedKey = "";
          }
          _0x1a1508();
        } catch (_0x17d8f4) {
          showPresetManagerToast(_0x17d8f4?.message || promptPresetsText("delete.failed"), "error");
          _0x382c9e.disabled = false;
        }
      });
      _0x4a3a92.appendChild(_0x382c9e);
      _0x381c7a.appendChild(_0x4a3a92);
    });
    const _0x5b1b05 = _0x1b227c.find(_0x1f9709 => _0x1f9709.key === _0x7ff36d.selectedKey);
    if (_0x5b1b05) {
      const _0x3ae4ff = createPresetEditor({
        nodeType: _0xdd346e,
        preset: _0x5b1b05.preset,
        isDraft: _0x5b1b05.isDraft,
        onSaved: ({
          title: _0xce2dc1
        } = {}) => {
          _0x7ff36d.draftPreset = null;
          _0x7ff36d.selectedKey = "saved:" + String(_0xce2dc1 || "").trim();
          _0x1a1508();
        }
      });
      _0x24e376.appendChild(_0x3ae4ff.element);
      _0x13745f.appendChild(_0x3ae4ff.triggerModeControl);
      _0x13745f.appendChild(_0x3ae4ff.saveButton);
    } else {
      const _0x58996d = document.createElement("div");
      _0x58996d.className = "preset-manager-detail-empty";
      _0x58996d.textContent = promptPresetsText("manager.emptyDetail");
      _0x24e376.appendChild(_0x58996d);
    }
  };
  const _0x7ad39b = _0x3dc307 => {
    if (!_0x408cc1) {
      return null;
    }
    const _0x6ebdb6 = a1174_0x20178c.getStateRaw().nodes?.[_0x408cc1];
    if (!_0x6ebdb6 || typeof _0x6ebdb6 !== "object") {
      return null;
    }
    if (String(_0x6ebdb6.type || "") === _0x3dc307) {
      return _0x6ebdb6;
    } else {
      return null;
    }
  };
  const _0x26e20c = async ({
    nodeType: _0x176b49,
    draftPreset: _0x7aaf51
  }) => {
    const _0x55e5bb = _0x7ad39b(_0x176b49);
    if (!_0x55e5bb) {
      return;
    }
    const _0xa4fd24 = await resolvePresetDefaultCoverDataUrl(_0x55e5bb);
    if (!_0xa4fd24) {
      return;
    }
    const _0x24cee9 = _0xd5dc3b(_0x176b49);
    if (_0x24cee9.draftPreset !== _0x7aaf51) {
      return;
    }
    if (String(_0x7aaf51.thumbnailDataUrl || "").trim() || String(_0x7aaf51.thumbLocalPath || "").trim() || String(_0x7aaf51.thumbUrl || "").trim()) {
      return;
    }
    _0x7aaf51.thumbnailDataUrl = _0xa4fd24;
    _0x7aaf51.thumbLocalPath = "";
    _0x7aaf51.thumbUrl = "";
    _0x1a1508();
  };
  _0x3dd33d.addEventListener("click", () => {
    const _0x465a88 = _0xd5dc3b(_0xdd346e);
    _0x465a88.draftCounter += 1;
    const _0x3d0aec = _0xdd346e;
    _0x465a88.draftPreset = {
      id: _0x465a88.draftCounter,
      title: getUniqueDraftTitle(getCustomPromptPresets(_0x3d0aec)),
      desc: "",
      template: "",
      triggerMode: PROMPT_PRESET_TRIGGER_MODE_DIRECT
    };
    _0x465a88.selectedKey = "draft:" + _0x465a88.draftPreset.id;
    _0x1a1508();
    _0x26e20c({
      nodeType: _0x3d0aec,
      draftPreset: _0x465a88.draftPreset
    });
  });
  _0x45b4b9.appendChild(_0x2bf424);
  _0x45b4b9.appendChild(_0x41be2a);
  _0x45b4b9.appendChild(_0x1a7899);
  _0x45b4b9.appendChild(_0x13745f);
  _0x1dedf8.appendChild(_0x45b4b9);
  _0x1a1508();
  _0x1dedf8.addEventListener("mousedown", _0x3e8768 => {
    if (_0x3e8768.target === _0x1dedf8) {
      _0x1dedf8.remove();
    }
  });
  document.body.appendChild(_0x1dedf8);
}