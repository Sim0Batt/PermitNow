package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingBookRowDocument
import database.documents.FishingPageDocument
import exceptions.FishingBookException
import server.models.input.FishingRowJson
import java.time.LocalDate

class BooksManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration) {

    val userCollection = connection.userCollection
    val fishingPagesCollection = connection.fishingPagesCollection
    val fishingRowsCollection = connection.fishingRowsCollection

    suspend fun createNewPage(bookId: String){
        try {
            fishingPagesCollection.insertOne(
                FishingPageDocument(
                    bookId = bookId,
                )
            )
        }catch (e: Exception) {
            e.printStackTrace()
            throw FishingBookException("Error while adding page $bookId. ${e.message}")
        }
    }

    suspend fun addRowToPage(pageId: String, fishingRow: FishingRowJson){
        try {
            fishingRowsCollection.insertOne(
                FishingBookRowDocument(
                    pageId = pageId,
                    fishName = fishingRow.fishName,
                    date = fishingRow.date,
                    zone = fishingRow.zone,
                    specie = fishingRow.specie,
                    measure = fishingRow.measure,
                )
            )
        }catch (e: Exception) {
            e.printStackTrace()
            throw FishingBookException("Error while adding row to page $pageId. ${e.message}")
        }
    }
}