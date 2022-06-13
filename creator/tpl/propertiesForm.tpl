<!-- StyleEditorのHTML -->
<div class="ScatterPlot">
	<!-- CSVファイルのフォーム -->
	<div class="panel">
		<label for="csv_file" class="i18n">CSV file</label>
		<input type="file" class="csv-select-form d-none" id="csvFile" name="csvFile" accept="text/csv" />
		<label for="csvFile" role="button" class="small btn-info d-block mx-3">
			<span class="icon-folder-open p-0 m-0 text-white"></span>
			<span class="i18n">Select file</span>
		</label>
		<input type="hidden" class="csv-raw-data" id="csvData" name="csvData" value='{{csvData}}' />
		<input type="hidden" class="csv-column-names" id="csvColumnNames" name="csvColumnNames"
			value='{{csvColumnNames}}' />
		<input type="hidden" class="i18n-locale" id="i18nLocale" name="i18nLocale" value='{{i18nLocale}}' />
	</div>
	<script>
		/**
		 * 文字コードチェック関数
		 * https://github.com/hcodes/isutf8 
		 * Author: Denis Seleznev
		/*
		   https://tools.ietf.org/html/rfc3629
		   UTF8-char = UTF8-1 / UTF8-2 / UTF8-3 / UTF8-4
		   UTF8-1    = %x00-7F
		   UTF8-2    = %xC2-DF UTF8-tail
		   UTF8-3    = %xE0 %xA0-BF UTF8-tail
					   %xE1-EC 2( UTF8-tail )
					   %xED %x80-9F UTF8-tail
					   %xEE-EF 2( UTF8-tail )
		   UTF8-4    = %xF0 %x90-BF 2( UTF8-tail )
					   %xF1-F3 3( UTF8-tail )
					   %xF4 %x80-8F 2( UTF8-tail )
		   UTF8-tail = %x80-BF
		*/
		/**
		 * Check if a Node.js Buffer or Uint8Array is UTF-8.
		 */
		function isUtf8(buf) {
			if (!buf) {
				return false;
			}
			var i = 0;
			var len = buf.length;
			while (i < len) {
				// UTF8-1 = %x00-7F
				if (buf[i] <= 0x7F) {
					i++;
					continue;
				}
				// UTF8-2 = %xC2-DF UTF8-tail
				if (buf[i] >= 0xC2 && buf[i] <= 0xDF) {
					// if(buf[i + 1] >= 0x80 && buf[i + 1] <= 0xBF) {
					if (buf[i + 1] >> 6 === 2) {
						i += 2;
						continue;
					}
					else {
						return false;
					}
				}
				// UTF8-3 = %xE0 %xA0-BF UTF8-tail
				// UTF8-3 = %xED %x80-9F UTF8-tail
				if (((buf[i] === 0xE0 && buf[i + 1] >= 0xA0 && buf[i + 1] <= 0xBF) ||
					(buf[i] === 0xED && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x9F)) && buf[i + 2] >> 6 === 2) {
					i += 3;
					continue;
				}
				// UTF8-3 = %xE1-EC 2( UTF8-tail )
				// UTF8-3 = %xEE-EF 2( UTF8-tail )
				if (((buf[i] >= 0xE1 && buf[i] <= 0xEC) ||
					(buf[i] >= 0xEE && buf[i] <= 0xEF)) &&
					buf[i + 1] >> 6 === 2 &&
					buf[i + 2] >> 6 === 2) {
					i += 3;
					continue;
				}
				// UTF8-4 = %xF0 %x90-BF 2( UTF8-tail )
				//          %xF1-F3 3( UTF8-tail )
				//          %xF4 %x80-8F 2( UTF8-tail )
				if (((buf[i] === 0xF0 && buf[i + 1] >= 0x90 && buf[i + 1] <= 0xBF) ||
					(buf[i] >= 0xF1 && buf[i] <= 0xF3 && buf[i + 1] >> 6 === 2) ||
					(buf[i] === 0xF4 && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x8F)) &&
					buf[i + 2] >> 6 === 2 &&
					buf[i + 3] >> 6 === 2) {
					i += 4;
					continue;
				}
				return false;
			}
			return true;
		}
		// FileReaderを作成
		var fileReader = new FileReader();
		// FileReaderのloadイベントハンドラ
		fileReader.addEventListener('load', function () {
			//ファイルの中身をarrayに格納する
			var array = new Uint8Array(this.result);
			var encodingUTF8 = isUtf8(array);
			var utf8String = '';
			// 文字コードのチェック
			if (encodingUTF8) {
				var text_decoder = new TextDecoder("utf-8");
				utf8String = text_decoder.decode(array);
			}
			else {
				alert("CSVファイルの文字コードがUTF-8ではありません。");
				return false;
			}
			// hiddenの値にファイルの中身を格納
			$('#csvData').val(utf8String).change();
		});
		// csvファイル選択時のイベントハンドラ
		$('input.csv-select-form').change(function (event) {
			console.log("CSVファイルが変更されました。");
			var files = event.target.files; // FileList object
			// 最初のファイルだけ処理する
			var f = files[0];
			// ファイル名
			var file_name = f.name;
			console.log("ファイル名:" + file_name);
			sessionStorage.setItem("{{identifier}}" + ":csv_file_name", file_name);
			// ファイルの内容を配列に読み込む
			fileReader.readAsArrayBuffer(f);
		});
	</script>
	<!-- 基データラベル -->
	<div class="panel">
		<label for="rawDataCaptionAgent" class="has-icon i18n">Raw data caption</label>
		<input type="text" class="rawDataCaptionAgent" id="rawDataCaptionAgent" name="rawDataCaptionAgent"
			value="{{rawDataCaption}}" />
		<input type="hidden" class="rawDataCaption" id="rawDataCaption" name="rawDataCaption"
			value='{{rawDataCaption}}' />
		<script>
			// 基データラベルの更新イベントハンドラ
			// type=text のフォームをそのまま使用すると、KeyDown,KeyUpで更新イベント処理が動きすぎるので、
			// 仲介のフォームへの入力が終わったら type=hidden のフォームに値を移して change イベントをトリガーするように実装しています。
			$('input.rawDataCaptionAgent').change(function (event) {
				var rawDataCaption = $(this).val();
				$('input.rawDataCaption').val(rawDataCaption).change();
			});
		</script>
	</div>
	<!-- 散布図ラベル -->
	<div class="panel">
		<label for="scatterPlotCaptionAgent" class="has-icon i18n">Scatter Plot caption</label>
		<input type="text" class="scatterPlotCaptionAgent" id="scatterPlotCaptionAgent" name="scatterPlotCaptionAgent"
			value="{{scatterPlotCaption}}" />
		<input type="hidden" class="scatterPlotCaption" id="scatterPlotCaption" name="scatterPlotCaption"
			value='{{scatterPlotCaption}}' />
		<script>
			// クロス集計表ラベルの更新イベントハンドラ
			$('input.scatterPlotCaptionAgent').change(function (event) {
				var scatterPlotCaption = $(this).val();
				$('input.scatterPlotCaption').val(scatterPlotCaption).change();
			});
		</script>
	</div>
	<!-- データの削除可否フラグ -->
	<div class="card card-style-editor p-2 shadow-2dp my-4">
		<div class="panel mb-0">
			<div>
				<input type="checkbox" id="plotExcludable" name="plotExcludable" {{#if plotExcludable}}checked{{/if}}
					style="vertical-align: middle;" />
				<label for="plotExcludable" class="i18n">Plot Excludable</label>
			</div>
			<script>
				// データ削除可否の変更イベントハンドラ
				$('input#plotExcludable').change(function (event) {
					var plotExcludable = ($(this).prop('checked')) ? true : false;
					// 削除可の場合だけラジオボタンを有効にする
					$('div#plotShowOrHide input').prop('disabled', !plotExcludable);
					if (plotExcludable) {
						$('div.panel-plot-show-or-hide span.unicode-emoji').removeClass('unicode-emoji-mute');
					}
					else {
						$('div.panel-plot-show-or-hide span.unicode-emoji').addClass('unicode-emoji-mute');
					}
				});
			</script>
		</div>
		<!-- チェックしたら表示するか隠すか -->
		<div class="panel panel-plot-show-or-hide {{#if plotExcludable}}{{else}}__d-none{{/if}}">
			<div id="plotShowOrHide" class="px-0">
				<div class="row">
					<div class="col">
						<input class="m-0" id="plotShow" type="radio" name="plotShowOrHide" value="show"
							style="vertical-align: middle;" {{#if plotShow}}checked{{/if}} {{#if
							plotExcludable}}{{else}}disabled{{/if}} />
						<label class="m-0" for="plotShow">
							<span class="icon-preview d-none"></span>
							<span
								class="unicode-emoji unicode-emoji-eye {{#if plotExcludable}}{{else}}unicode-emoji-mute{{/if}}"></span>
							<span class="i18n">Show checked items</span>
						</label>
					</div>
				</div>
				<div class="row">
					<div class="col">
						<input class="m-0" id="plotHide" type="radio" name="plotShowOrHide" value="hide"
							style="vertical-align: middle;" {{#if plotHide}}checked{{/if}} {{#if
							plotExcludable}}{{else}}disabled{{/if}} />
						<label class="m-0" for="plotHide">
							<span class="icon-bin ml-1 d-none"></span>
							<span
								class="unicode-emoji unicode-emoji-trash {{#if plotExcludable}}{{else}}unicode-emoji-mute{{/if}}"></span>
							<span class="i18n">Hide checked items</span>
						</label>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- グラフ種別指定 -->
	<div class="panel">
		<label for="graphType" class="i18n">Graph Type</label>
		<div id="graphType" class="pl-2">
			<div class="row">
				<div class="col">
					<input id="graphTypeScatterPlot" type="radio" name="graphType" value="scatter"
						style="vertical-align: middle;" {{#if graphTypeScatterPlot}}checked{{/if}}>
					<label for="graphTypeScatterPlot" class="m-0 i18n">Scatter Plot</label>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<input id="graphTypeBubbleChart" type="radio" name="graphType" value="bubble"
						style="vertical-align: middle;" {{#if graphTypeBubbleChart}}checked{{/if}}>
					<label for="graphTypeBubbleChart" class="m-0 i18n">Bubble Chart</label>
				</div>
			</div>
		</div>
	</div>
	<!-- 初期設定ｘ軸 -->
	<div class="panel">
		<label for="xAxis" class="i18n">X axis</label>
		<select name="xAxis" id="xAxis" data-has-search="false">
			<option value="">-</option>
			{{#each xAxisList}}
			<option value="{{@key}}" {{#if selected}}selected="selected" {{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<!-- 初期設定ｙ軸 -->
	<div class="panel">
		<label for="yAxis" class="i18n">Y axis</label>
		<select name="yAxis" id="yAxis" data-has-search="false">
			<option value="">-</option>
			{{#each yAxisList}}
			<option value="{{@key}}" {{#if selected}}selected="selected" {{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<!-- 初期設定 グループ指定 -->
	<div class="panel">
		<label for="groupBy" class="i18n">Group Setting</label>
		<select name="groupBy" id="groupBy" data-has-search="false">
			<option value="">-</option>
			{{#each groupByList}}
			<option value="{{@key}}" {{#if selected}}selected="selected" {{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<!-- バブルチャートの値(直径) -->
	<div class="panel">
		<label for="bubbleChartValue" class="i18n">Bubble Chart Value</label>
		<select name="bubbleChartValue" id="bubbleChartValue" data-has-search="false" {{#if
			graphTypeScatterPlot}}disabled{{/if}}>
			<option value="__count__" class="i18n">Count</option>
			{{#each bubbleChartValueList}}
			<option value="{{@key}}" {{#if selected}}selected="selected" {{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<!-- 相関係数 -->
	<div class="card card-style-editor p-2 shadow-2dp my-4">
		<label class="mb-0 i18n">Correlation Coefficient</label>
		<div class="panel mb-0">
			<div>
				<!-- 初期表示設定 -->
				<input type="checkbox" id="showCorrelation" name="showCorrelation" {{#if showCorrelation}}checked{{/if}}
					style="vertical-align: middle;" />
				<label for="showCorrelation" class="m-0 i18n">Show</label>
			</div>
			<div>
				<!-- 受験者による編集可否設定 -->
				<input type="checkbox" id="correlationEditable" name="correlationEditable" {{#if
					correlationEditable}}checked{{/if}} style="vertical-align: middle;" />
				<label for="correlationEditable" class="m-0 i18n">Editable by Test-taker</label>
			</div>
		</div>
	</div>
	<!-- 回帰直線 -->
	<div class="card card-style-editor p-2 shadow-2dp my-4">
		<label class="mb-0 i18n">Regression Line</label>
		<div class="panel mb-0">
			<!-- 初期表示設定 -->
			<div>
				<input type="checkbox" id="showRegressionLine" name="showRegressionLine" {{#if
					showRegressionLine}}checked{{/if}} style="vertical-align: middle;" />
				<label for="showRegressionLine" class="m-0 i18n">Show</label>
			</div>
			<!-- 受験者による編集可否設定 -->
			<div>
				<input type="checkbox" id="regressionLineEditable" name="regressionLineEditable" {{#if
					regressionLineEditable}}checked{{/if}} style="vertical-align: middle;" />
				<label for="regressionLineEditable" class="m-0 i18n">Editable by Test-taker</label>
			</div>
		</div>
		<!-- 決定係数 -->
		<div id="CoefficientOfDetermination" class="card card-style-editor p-2 m-0 mt-2 shadow-2dp">
			<label class="mb-0 i18n">Coefficient of Determination</label>
			<div class="panel mb-0">
				<div>
					<!-- 初期表示設定 -->
					<input type="checkbox" id="showRsquared" name="showRsquared" {{#if showRsquared}}checked{{/if}}
						style="vertical-align: middle;" class="m-0" />
					<label for="showRsquared" class="m-0 i18n">Show</label>
				</div>
				<div>
					<!-- 受験者による編集可否設定 -->
					<input type="checkbox" id="RsquaredEditable" name="RsquaredEditable" {{#if
						RsquaredEditable}}checked{{/if}} style="vertical-align: middle;" class="m-0" />
					<label for="RsquaredEditable" class="m-0 i18n">Editable by Test-taker</label>
				</div>
			</div>
		</div>
	</div>
	<script>
		// 初期表示設定変更時のイベントハンドラ
		$('input#showRegressionLine,input#regressionLineEditable').change(function (event) {
			var show = ($('input#showRegressionLine').prop('checked')) ? true : false;
			var editable = ($('input#regressionLineEditable').prop('checked')) ? true : false;
			$('div#CoefficientOfDetermination input').prop('disabled', (show || editable) ? false : true);
		});
		// 初回表示時の設定
		$(function () {
			$('div#CoefficientOfDetermination input').prop('disabled', ($("input#showRegressionLine").prop('checked') || $("input#regressionLineEditable").prop('checked')) ? false : true);
		});
	</script>
	<!-- グラフの配色 -->
	<div class="panel">
		<label for="colorScheme" class="i18n">Color scheme</label>
		<select name="colorScheme" id="colorScheme" data-has-search="false">
			{{#each colorSchemeList}}
			<option value="{{value}}" {{#if selected}}selected="selected" {{/if}}>{{label}}</option>
			{{/each}}
		</select>
	</div>
	<!-- 操作ログ -->
	<div class="panel">
		<input id="storeOperationLog" name="storeOperationLog" type="checkbox" {{#if storeOperationLog}}checked{{/if}}
			style="vertical-align: middle;" />
		<label for="storeOperationLog" class="i18n">Store operation log</label>
	</div>
	<div class="panel">
		<label for="" class="has-icon i18n">Response identifier</label>
		<input type="text" name="identifier" value="{{identifier}}" placeholder="e.g. RESPONSE"
			data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});" />
	</div>
</div>