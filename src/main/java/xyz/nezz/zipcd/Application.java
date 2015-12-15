package xyz.nezz.zipcd;

import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import xyz.nezz.zipcd.model.TestFile;
import xyz.nezz.zipcd.model.Zipcd;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

/**
 * Created by 140179 on 2015-12-15.
 */
@SpringBootApplication
public class Application {

    @Resource
    TestFile testFile;
    final static String TEMP_PATH = "./temp/";
    final static String OUTPUT_PATH = "./output/";

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @PostConstruct
    public void start() {

        List<Zipcd> addrList = testFile.getList();


        for (int i = 0; i < addrList.size(); i++) {
            Zipcd zipcd = addrList.get(i);
            String imgName = zipcd.getType() + "_" + i;
            zipcd.setImgName(imgName);


            splitAddr(zipcd);
            runZipcdTester(zipcd);
            mergeImages(zipcd);
        }
    }

    public void splitAddr(Zipcd zipcd) {

        try {
                String addr[] = StringUtils.split(zipcd.getAddr().trim(), " ");

                String sdNm = addr[0];
                String sggNm = addr[1];
                String roadNm = "";

                for (int i=2; i<addr.length; i++) {
                    if (addr[i].endsWith("읍")  || addr[i].endsWith("면")  || addr[i].endsWith("동")) {
                        continue;
                    }
                    if (addr[i].endsWith("구")) {
                        sggNm += " " + addr[i];
                        continue;
                    }
                    roadNm += addr[i] + " ";
                }
                zipcd.setSdNm(sdNm);
                zipcd.setSggNm(sggNm);
                zipcd.setRoadNm(roadNm);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void runZipcdTester(Zipcd zipcd) {
        String[] cmd = {"casperjs", "./casperjs/tester.js", "--zone=" + testFile.getZone(), "--imgName=" + zipcd.getImgName(), "--sdNm='"+zipcd.getSdNm() + "'", "--sggNm='" + zipcd.getSggNm() + "'", "--roadNm='" + zipcd.getRoadNm() + "'"};

        runShellCmd(cmd);
    }

    public void mergeImages(Zipcd zipcd) {
        String img1 = TEMP_PATH + zipcd.getImgName() + "_" + testFile.getZone() + ".png";
        String img2 = TEMP_PATH + zipcd.getImgName() + "_prod.png";
        String outputImg = OUTPUT_PATH + zipcd.getImgName() + ".png";

        String[] cmd = {"gm", "convert", "+append", img1, img2, outputImg};
        runShellCmd(cmd);
    }

    public void runShellCmd(String[] cmd) {
        Process p;
        StringBuffer output = new StringBuffer();
        try {
            p = Runtime.getRuntime().exec(cmd);
            p.waitFor();
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line = "";
            while ((line = reader.readLine()) != null) {
                output.append(line + "\n");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println(output.toString());
    }
}
