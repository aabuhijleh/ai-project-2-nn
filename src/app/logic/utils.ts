export class Utils {
  public static sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
  }

  public static sigmoidDerivative(x: number) {
    return x * (1 - x);
  }

  public static tanh(x: number) {
    return Math.tanh(x);
  }

  public static tanhDerivative(x: number) {
    return 1 - Math.pow(Math.tanh(x), 2);
  }

  public static relu(x: number) {
    return Math.max(0, x);
  }

  public static reluDerivative(x: number) {
    return x > 0 ? 1 : 0;
  }
}
