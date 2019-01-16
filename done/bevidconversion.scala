package com.cp.cda.util

import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import scalaz.Traverse
import scalaz.std.list._
import scalaz.std.option._

object BevIdConversion {
  /*
  {
    "origin": "qr",
    "status": null,
    "target": "usedefault",
    "type": "pour",
    "payload": {
      "seed": "02949433",
      "fbid": "eeebf391-df1f-4242-9f37-331a3f6655ba",
      "pour": {
        "custom": {
          "name": "Berry Cherry",
          "mixItems": [
            {
              "bevID": 1475620,
              "ratio": 33
            },
            {
              "bevID": 1482850,
              "ratio": 34
            },
            {
              "bevID": 1582396,
              "ratio": 33
            }
          ]
        }
      }
    }
  }

    // Example of custom pour message format to put on the queue
   "details": {
          "pourType": "custom",
          "mix": {
              "name": "PZero",
              "mixItems": [
                  {
                      "bevID": 1491139,
                      "ratio": 75
                  },
                  {
                      "bevID": 1491142,
                      "ratio": 25
                  }
              ]
          }
      }
   */

  def adjustCase(pour: JsValue): JsValue = {

    // Convert the case of the 'bevID' fields
    def checkBev(mixItem: Option[JsObject]): Option[JsObject] =
      mixItem.map(jso => JsObject(jso.fields.map { case (n, v) => if ("bevID" == n) "bevId" -> v else n -> v }))


    def sequence(seq: Seq[Option[JsObject]]): Option[JsArray] =
      Traverse[List].sequence(seq.toList).map(objs => JsArray(objs))


    val arrOpt = for {
      jso <- pour.asOpt[JsObject]
      jsa1 <- (jso \ "mixItems").asOpt[JsArray]
      seq = for {
        jsv <- jsa1.value
        jso = checkBev(jsv.asOpt[JsObject])
      } yield jso
      jsa2 <- sequence(seq)
    } yield jsa2

    val objOpt = for {
      p <- pour.asOpt[JsObject]
      m <- arrOpt
    } yield JsObject(p.value.updated("mixItems", m).toList)

    objOpt.getOrElse(pour)
  }

  val json = "{\n          \"name\": \"Berry Cherry\",\n          \"mixItems\": [\n            {\n              \"bevID\": 1475620,\n              \"ratio\": 33\n            },\n            {\n              \"bevID\": 1482850,\n              \"ratio\": 34\n            },\n            {\n              \"bevID\": 1582396,\n              \"ratio\": 33\n            }\n          ]\n        }"

  def main(args: Array[String]): Unit = {
    val jsv = Json.parse(json)

    val r = adjustCase(jsv)

    println(r)
  }

}
