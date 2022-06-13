/**
 * 散布図 多言語対応
 */
define(function () {
	/**
	 * 言語識別子
	 */
	const LANG_JP = 'ja-JP'

	/**
	 * 置き換え設定
	 */
	const TRANSLATION_TABLE = {
		// 日本語設定
		'ja-JP': {
			'CSV file': 'CSVファイル',
			'Select file': 'ファイルを選択',
			'Raw data caption': 'データ名',
			'Scatter Plot caption': '散布図名',
			'Plot Excludable': 'データ除外欄表示',
			'Show checked items': 'ﾁｪｯｸ項目を表示',
			'Hide checked items': 'ﾁｪｯｸ項目を非表示',
			'Graph Type': 'グラフ形式',
			'Scatter Plot': '散布図',
			'Bubble Chart': 'ﾊﾞﾌﾞﾙﾁｬｰﾄ',
			'X axis': 'X軸',
			'Y axis': 'Y軸',
			'Group Setting': 'ｸﾞﾙｰﾌﾟ別表示',
			'Bubble Chart Value': 'ﾊﾞﾌﾞﾙｻｲｽﾞ',
			'Bubble Value': 'ﾊﾞﾌﾞﾙｻｲｽﾞ',
			'Correlation Coefficient': '相関係数',
			'Show': '表示',
			'Editable by Test-taker': '受験者が操作可能',
			'Regression Line': '回帰直線',
			'Coefficient of Determination': '決定係数(Ｒ²)',
			'Color scheme': '配色',
			'Store operation log': '操作ログの記録',
			'Response identifier': 'レスポンス識別子',
			'Reset': 'リセット',
			'Add Graph': 'グラフを追加',
			'Remove Graph': 'グラフを削除',
			'Regression line cannot be displayed': '回帰直線表示不可',
			'Count': '件数',
			'Show Correlation Coefficient': '相関係数を表示する',
			'Show Regression Line': '回帰直線を表示する',
			'Show Coefficient of Determination': '決定係数を表示する'
		}
	}

	/**
	 * メイン
	 */
	return {
		/**
		 * 与えられた文字列を指定言語に変換
		 * 変換できなかった場合はundef_value(デフォルトはundefined)を返す
		 *
		 * @param {string} language
		 * @param {string} label
		 * @param {string/undefind} undef_value 
		 * @returns 
		 */
		translate: function (language, label, undef_value = undefined) {
			return (language in TRANSLATION_TABLE) ? (label in TRANSLATION_TABLE[language] ? TRANSLATION_TABLE[language][label] : undef_value) : undef_value;
		},
		/**
		 * 指定された言語の変換テーブルを取得
		 * @param {string} language
		 * @returns {Object}
		 */
		getTranslationTable: function (language) {
			return language in TRANSLATION_TABLE ? TRANSLATION_TABLE[language] : undefined
		}
	}
})
