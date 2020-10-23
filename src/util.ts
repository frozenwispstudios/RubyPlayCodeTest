export class Util {

	public static formatNumber(p_num: number): string {
		let fixed: string = p_num.toFixed(0);
		if (fixed.length > 3) {
			fixed = fixed.substr(0, fixed.length - 3) + "," + fixed.substr(fixed.length - 3);
		}
		while (fixed.indexOf(",") > 3) {
			fixed = fixed.substr(0, fixed.indexOf(",") - 3) + "," + fixed.substr(fixed.indexOf(",") - 3);
		}
		return fixed;
    }

	public static shuffle<T>(array: T[]): T[] {
		// if it's 1 or 0 items, just return
		if (array.length <= 1) {
			return array;
		}

		for (let i: number = array.length - 1; i >= 0; i--) {
			const randomIndex: number = Math.floor(Math.random() * (i + 1));
			const itemAtIndex: T = array[randomIndex];

			array[randomIndex] = array[i];
			array[i] = itemAtIndex;
		}
		return array;
	}
}