/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package uk.org.tiro.android.Inscriptions;

import java.io.*;
import android.os.Bundle;
import org.apache.cordova.*;

public class Inscriptions extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        try {
                File dbFile = getDatabasePath("inscriptions.db");
                /* RELEASE - ensure copy only done first run 
                if(!dbFile.exists()) {
                */
                this.copy("inscriptions.db", dbFile.getAbsolutePath());
                /* RELEASE
                }
                */
        }
        catch (Exception e) {
                e.printStackTrace();
        }

        super.onCreate(savedInstanceState);
        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl());
        //super.loadUrl("file:///android_asset/www/index.html")
    }


    void copy(String file, String folder) throws IOException {
      File checkDirectory;
      checkDirectory = new File(folder);

      String parentPath = checkDirectory.getParent();

      File fileDir = new File(parentPath);
      if (!fileDir.exists()) {
         if (!fileDir.mkdirs()) {
             return;
         }
      }

      InputStream in = this.getApplicationContext().getAssets().open(file);
      File newFile = new File(folder);
      OutputStream out = new FileOutputStream(newFile);

      byte[] buf = new byte[1024];
      int len; while ((len = in.read(buf)) > 0) out.write(buf, 0, len);
      in.close(); out.close();

    }
}

