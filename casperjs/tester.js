var casper = require('casper').create();
var utils = require('utils');

/* Param */
var zone = casper.cli.get('zone');
var sdNm = casper.cli.get('sdNm');
var sggNm = casper.cli.get('sggNm');
var roadNm = casper.cli.get('roadNm');
var imgName = casper.cli.get('imgName');

var url = 'http://member.ssg.com/addr/popup/zipcd.ssg';
var prodUrl = 'http://member.ssg.com/addr/popup/zipcd.ssg';
if (zone !== 'prod') {
    url = url.replace("http://", "http://" + zone + "-");
}

casper.on('remote.alert', function(message) {
    this.echo('alert message: ' + message);
});

casper.testDrm = function(sdNm, sggNm, roadNmAddrQuery) {
    this.evaluate(function(sdNm, sggNm, roadNmAddrQuery) {
        $("select[name='sdNm'] option").filter(function() {
            return $(this).text() == sdNm;
        }).prop('selected', true);
        $("select[name='sdNm']").change();

        $("select[name='sggNm'] option").filter(function() {
            return $(this).text() == sggNm;
        }).prop('selected', true);

        $("#roadNmAddrQuery").val(roadNmAddrQuery);
    }, sdNm, sggNm, roadNmAddrQuery);

    this.click("#address_street .btn.small.slightly2 span");
};

casper.testJibun = function(addrDong) {
    this.click("ul.tab.large.ssg_tab li:nth-child(2) a");
    this.evaluate(function(addrDong) {
        $("#addr_dong").val(addrDong);
    }, addrDong);
    this.click("form button[type='submit']");
};

casper.captureImg = function(zone) {
    this.wait(1500, function() {
        var fileName = './temp/' + imgName + '_' + zone + '.png';
        this.capture(fileName, null, { format:'png' });
    });
};

casper.start();

// param check
casper.then(function() {

    if (zone === undefined || zone === '') {
        this.echo('usage: casperjs tester.js --zone={dev|qa|stg|prod} --sdNm --sggNm --roadNm');
        this.exit();
    }

    this.echo('zone: ' + zone);
    this.echo('url: ' + url);
    this.echo('test query: ' + sdNm + ' ' + sggNm + ' ' + roadNm );
});

// specific zone test
casper.thenOpen(url, function() {
    this.testDrm(sdNm, sggNm, roadNm);
});

casper.then(function() {
    if (this.exists('#address_street div.section.searchResult table table tbody tr')) {
        var zipcd = this.getHTML('#address_street div.section.searchResult table table tbody tr td:nth-child(1)');
        var drmBascAddr = this.getHTML('#address_street div.section.searchResult table table tbody tr td a');
        this.echo(zipcd + ' ' + drmBascAddr);

        this.captureImg(zone);
    } else {
        this.wait(1500, function() {
            if (this.exists('#address_street div.section.searchResult table table tbody tr')) {
                var zipcd = this.getHTML('#address_street div.section.searchResult table table tbody tr td:nth-child(1)');
                var drmBascAddr = this.getHTML('#address_street div.section.searchResult table table tbody tr td a');
                this.echo(zipcd + ' ' + drmBascAddr);

                this.captureImg(zone);
            } else {
                this.echo('no data');
                this.captureImg(zone);
            }
        });
    }
});

casper.thenOpen(prodUrl, function() {
    this.testDrm(sdNm, sggNm, roadNm);
});

casper.then(function() {
    if (this.exists('#address_street div.section.searchResult table table tbody tr')) {
        var zipcd = this.getHTML('#address_street div.section.searchResult table table tbody tr td:nth-child(1)');
        var drmBascAddr = this.getHTML('#address_street div.section.searchResult table table tbody tr td a');
        this.echo(zipcd + ' ' + drmBascAddr);

        this.captureImg('prod');
    } else {
        this.wait(1500, function() {
            if (this.exists('#address_street div.section.searchResult table table tbody tr')) {
                var zipcd = this.getHTML('#address_street div.section.searchResult table table tbody tr td:nth-child(1)');
                var drmBascAddr = this.getHTML('#address_street div.section.searchResult table table tbody tr td a');
                this.echo(zipcd + ' ' + drmBascAddr);

                this.captureImg('prod');
            } else {
                this.echo('no data');
                this.captureImg('prod');
            }
        });
    }
});

casper.run(function () {
    //this.debugPage();
    this.exit();
});
