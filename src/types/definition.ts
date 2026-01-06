import type { LiteralUnion } from "type-fest"
import type { TransporterOptions } from "../core/transporter"
import type { NodeProperty } from "./node-property"

/**
 * I18n Entry
 */
export interface I18nText {
  /**
   * English is required
   */
  en_US: string
  [locale: `${LiteralUnion<"zh_Hans", string>}_${string}`]: string | undefined
}

export interface BaseDefinition {
  /**
   * Name
   */
  name: string
  /**
   * Display name
   */
  display_name: I18nText
  /**
   * Description
   */
  description: I18nText
  /**
   * Icon, allowed to use Emoji or URL address
   */
  icon: string | URL
  /**
   * Parameters
   */
  parameters: NodeProperty[]
  /**
   * Settings
   */
  settings?: NodeProperty[]
}

/**
 * Plugin definition
 */
export interface PluginDefinition<Locales extends string[] = string[]>
  extends Omit<BaseDefinition, "parameters" | "settings"> {
  /**
   * The locales to support. Defaults to ["en_US"].
   */
  locales: Locales
  /**
   * The options for the transporter.
   */
  transporterOptions?: TransporterOptions
}

export type Feature = CredentialDefinition | DataSourceDefinition | ModelDefinition | ToolDefinition

/**
 * Credential definition
 */
export interface CredentialDefinition extends Omit<BaseDefinition, "settings"> {
  type: "credential"
}

/**
 * DataSource definition
 */
export interface DataSourceDefinition extends BaseDefinition {
  type: "data_source"
}

/**
 * Model definition
 */
export interface ModelDefinition extends BaseDefinition {
  type: "model"
  /**
   * The unique name of the model.
   *
   * Plugin authors should use the **"model_provider/model_name"** format to define this field.
   */
  name: string // NOTE: Do not define it as a template literal, use zod schema instead
  /**
   * Maximum context window size in tokens.
   */
  context_window: number
  /**
   * Supported input types.
   */
  input_modalities: Array<"file" | "image" | "text">
  /**
   * Supported output types.
   */
  output_modalities: Array<"text">
  /**
   * All pricing values is in currency (if specified) per token/request.
   *
   * A value of 0 means the feature is free.
   */
  pricing?: {
    /**
     * The currency of the pricing. Defaults to "USD" if not specified.
     */
    currency?: string
    /**
     * Cost per input token.
     */
    input?: number
    /**
     * Input cache read token price.
     */
    input_cache_read?: number
    /**
     * Input cache write token price.
     */
    input_cache_write?: number
    /**
     * Cost per output token.
     */
    output?: number
    /**
     * Fixed cost per API request if applicable.
     */
    request?: number
  }
  /**
   * The details for each supported parameter are as follows:
   * ### temperature
   *   - **float**, 0.0 to 2.0, optional, default to 1.0
   *
   * This setting influences the variety in the model’s responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.
   *
   * ### top_p
   *   - **float**, 0.0 to 1.0, optional, default to 1.0
   *
   * This setting limits the model’s choices to a percentage of likely tokens: only the top tokens whose probabilities add up to P. A lower value makes the model’s responses more predictable, while the default setting allows for a full range of token choices. Think of it like a dynamic Top-K.
   *
   * ### top_k
   *   - **integer**, 0 or above, optional, default to 0
   *
   * This limits the model’s choice of tokens at each step, making it choose from a smaller set. A value of 1 means the model will always pick the most likely next token, leading to predictable results. By default this setting is disabled, making the model to consider all choices.
   *
   * ### frequency_penalty
   *   - **float**, -2.0 to 2.0, optional, default to 0.0
   *
   * This setting aims to control the repetition of tokens based on how often they appear in the input. It tries to use less frequently those tokens that appear more in the input, proportional to how frequently they occur. Token penalty scales with the number of occurrences. Negative values will encourage token reuse.
   *
   * ### presence_penalty
   *   - **float**, -2.0 to 2.0, optional, default to 0.0
   *
   * Adjusts how often the model repeats specific tokens already used in the input. Higher values make such repetition less likely, while negative values do the opposite. Token penalty does not scale with the number of occurrences. Negative values will encourage token reuse.
   *
   * ### repetition_penalty
   *   - **float**, 0.0 to 2.0, optional, default to 1.0
   *
   * Helps to reduce the repetition of tokens from the input. A higher value makes the model less likely to repeat tokens, but too high a value can make the output less coherent (often with run-on sentences that lack small words). Token penalty scales based on original token’s probability.
   *
   * ### min_p
   *   - **float**, 0.0 to 1.0, optional, default to 0.0
   *
   * Represents the minimum probability for a token to be considered, relative to the probability of the most likely token. (The value changes depending on the confidence level of the most probable token.) If your Min-P is set to 0.1, that means it will only allow for tokens that are at least 1/10th as probable as the best possible option.
   *
   * ### top_a
   *   - **float**, 0.0 to 1.0, optional, default to 0.0
   *
   * Consider only the top tokens with “sufficiently high” probabilities based on the probability of the most likely token. Think of it like a dynamic Top-P. A lower Top-A value focuses the choices based on the highest probability token but with a narrower scope. A higher Top-A value does not necessarily affect the creativity of the output, but rather refines the filtering process based on the maximum probability.
   *
   * ### seed
   *   - **integer**
   *
   * If specified, the inferencing will sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed for some models.
   *
   * ### max_tokens
   *   - **integer**, 1 or above, optional
   *
   * This sets the upper limit for the number of tokens the model can generate in response. It won’t produce more than this limit. The maximum value is the context length minus the prompt length.
   *
   * ### logit_bias
   *   - **object**, optional
   *
   * Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from -100 to 100. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.
   *
   * ### logprobs
   *   - **boolean**, optional
   *
   * Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned.
   *
   * ### top_logprobs
   *   - **integer**, optional
   *
   * An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.
   *
   * ### response_format
   *   - **object**, optional
   *
   * Forces the model to produce specific output format. Setting to { "type": "json_object" } enables JSON mode, which guarantees the message the model generates is valid JSON.
   *
   * Note: when using JSON mode, you should also instruct the model to produce JSON yourself via a system or user message.
   *
   * ### structured_outputs
   *   - **boolean**, optional
   *
   * If the model can return structured outputs using response_format json_schema.
   *
   * ### stop
   *   - **array of strings**, optional
   *
   * Tool calling parameter, following OpenAI’s tool calling request shape. For non-OpenAI providers, it will be transformed accordingly.
   *
   * ### tools
   *   - **array**, optional
   *
   * Tool calling parameter, following OpenAI’s tool calling request shape. For non-OpenAI providers, it will be transformed accordingly.
   *
   * ### tool_choice
   *   - **array**, optional
   *
   * Controls which (if any) tool is called by the model. ‘none’ means the model will not call any tool and instead generates a message. ‘auto’ means the model can pick between generating a message or calling one or more tools. ‘required’ means the model must call one or more tools. Specifying a particular tool via {"type": "function", "function": {"name": "my_function"}} forces the model to call that tool.
   *
   * ### parallel_tool_calls
   *   - **boolean**, optional, default to true
   *
   * Whether to enable parallel function calling during tool use. If true, the model can call multiple functions simultaneously. If false, functions will be called sequentially. Only applies when tools are provided.
   *
   * ### verbosity
   *   - **enum (low, medium, high)**, optional, default to "medium"
   *
   * Constrains the verbosity of the model’s response. Lower values produce more concise responses, while higher values produce more detailed and comprehensive responses. Introduced by OpenAI for the Responses API.
   *
   * For Anthropic models, this parameter maps to output_config.effort.
   */
  supported_parameters: Array<
    | "temperature"
    | "top_p"
    | "top_k"
    | "frequency_penalty"
    | "presence_penalty"
    | "repetition_penalty"
    | "min_p"
    | "top_a"
    | "seed"
    | "max_tokens"
    | "logit_bias"
    | "logprobs"
    | "top_logprobs"
    | "response_format"
    | "structured_outputs"
    | "stop"
    | "tools"
    | "tool_choice"
    | "parallel_tool_calls"
    | "verbosity"
  >
}

/**
 * Tool definition
 */
export interface ToolDefinition extends BaseDefinition {
  type: "tool"
  /**
   * The function to invoke when the tool is called.
   */
  invoke: (...args: unknown[]) => Promise<unknown>
}
