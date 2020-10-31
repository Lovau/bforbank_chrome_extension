
/**
 * Convert an HTML table into javascript array 
 * 
 * @param  table DOM
 * @param  isLivret Are we on account page or livret ?
 * @return array
 */
function getTableInJSON(table, isLivret) {
    var trs = table.find('tr').get().map(function(row) {
      return $(row).find('td,th').get().map(function(cell) {
        return $(cell).html();
      });
    });

    // console.log(trs);

    var data = [];
    var data_new_format = [];
    var countTR = 0;
    var date = 0;

    var formatLabel = function(label) {
        return $(label.trim()).text().trim().replace(/\s+/g,' ');
    };
    var formatMontant = function(montant) {
        montant = montant.replace(/&nbsp;€/, '');
        var numberOfCommas = montant.split(",").length - 1;
        if (numberOfCommas == 2) {
            montant = montant.replace(",", "");
        }
        return montant;
    };

    trs.forEach(function(tr, index) {
        if (index == 0) {
            return;
        }

        // Get Date
        if (tr[0].indexOf("Opérations du") !== -1) {
            date = $('<div>' + tr[0] + '</div>').text().trim().replace(/Opérations du /, '');
            date = date.substr(6,4) + "/" + date.substr(3,2) + "/" + date.substr(0,2);
        }

        // console.log(tr);
        if (tr.length > 1) {
            data.push(tr);
            countTR++;
        } else if (data.length > 0 && countTR != 0 && !isLivret) {
            countTR=0;
            data[data.length-1][0] += " / " + formatLabel(tr[0]);
            data[data.length-1][1] = formatMontant(data[data.length-1][1]);
            data[data.length-1][3] = $(data[data.length-1][2]).text().replace(/[^a-zA-Z0-9éèêç/\s]+/gi, '').trim();
            data[data.length-1][2] = date;

            // new format
            data_new_format[data.length-1] = [];
            data_new_format[data.length-1][0] = data[data.length-1][2];
            data_new_format[data.length-1][1] = data[data.length-1][1];
            data_new_format[data.length-1][2] = data[data.length-1][0];

        } else if (data.length > 0 && countTR != 0 && isLivret) {
            countTR=0;
            data[data.length-1][0] += " / " + formatLabel(tr[0]);
            data[data.length-1][2] = data[data.length-1][1];
            data[data.length-1][1] = formatMontant(data[data.length-1][3]);
            data[data.length-1].pop();
        }
        // if (index == 1) {
        //     console.log(data);
        //     exit;
        // }
    });

    console.log(data_new_format);
    return data_new_format;
}

/**
 * Convert a javascript array into CSV string
 * 
 * @param  JSON
 * @return a CSV string
 */
function convertToCSV(objArray, separator = ';') {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') {
                line += separator
            }

            line += '"' + array[i][index] + '"';
        }

        str += line + '\r\n';
    }

    return str;
}

/**
 * Create a CSV file based on headers and Array of data.
 * Then download the file from browser.
 * 
 * @param  headers      Array
 * @param  items        Array
 * @param  fileTitle    String
 */
function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFileName = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), // UTF-8 BOM
        csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFileName);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}




function startCSVDownload() {

    // Get data
    var table = $('table.with-paginator');

    // On est sur une page de livret, dont le formattage est different des comptes courants
    var isLivret = $("h1").text().indexOf("Livret") !== -1;
    var data = getTableInJSON(table, isLivret);
    var csv = convertToCSV(data);
    // console.log(csv);

    // var headers = ['libelle', 'montant', 'date'];
    var headers = ['date', 'montant', 'libelle'];
    // if (!isLivret) {
    //     headers.push('categorie');
    // }

    var today = new Date();
    var filename = isLivret ? 'releves_livret_' : 'releves_compte_';
    filename += today.toISOString().substring(0, 10);

    exportCSVFile(headers, data, filename);
}
