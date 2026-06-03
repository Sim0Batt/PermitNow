package managers

import configuration.PermitNowConfiguration
import database.DatabaseConfig
import database.documents.FishingBookRowDocument
import database.documents.FishingPageDocument
import database.documents.UserDocument
import exceptions.FishingBookException
import org.bson.types.ObjectId
import org.litote.kmongo.and
import org.litote.kmongo.eq
import server.models.input.FishingRowJson
import server.models.output.FishingPageInfoJson
import server.models.output.FishingRowInfoJson
import utils.fishes
import java.time.LocalDate

class BooksManager(val connection: DatabaseConfig, val permitNowConfiguration: PermitNowConfiguration) {

    val userCollection = connection.userCollection
    val fishingPagesCollection = connection.fishingPagesCollection
    val fishingRowsCollection = connection.fishingRowsCollection

    suspend fun createNewPage(userId: String){
        val bookId = userCollection.findOne(UserDocument::_id eq ObjectId(userId))!!.fishingLicense!!.bookCode ?: throw IllegalStateException("User not found")
        try {
            val fishingPage = fishingPagesCollection.findOne(and(FishingPageDocument::bookId eq bookId, FishingPageDocument::date eq LocalDate.now().toString()))
            if(fishingPage != null) throw IllegalStateException("Book already has a page for today")

            fishingPagesCollection.insertOne(
                FishingPageDocument(
                    bookId = bookId,
                    date = LocalDate.now().toString()
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

    suspend fun getPagesForBook(bookId: String): List<FishingPageInfoJson> {
        return fishingPagesCollection.find(FishingPageDocument::bookId eq bookId).toList().map {
            FishingPageInfoJson(
                id = it._id.toHexString(),
                bookId = it.bookId,
                date = it.date
            )
        }
    }

    suspend fun getRowsForPage(pageId: String): List<FishingRowInfoJson> {
        try{
            return fishingRowsCollection.find(FishingBookRowDocument::pageId eq pageId).toList().map {
                FishingRowInfoJson(
                    id = it._id.toHexString(),
                    pageId = it.pageId,
                    fishName = fishes.firstOrNull() { fish -> fish == it.fishName }
                        ?: throw IllegalStateException("Fish not found"),
                    zone = it.zone,
                    specie = it.specie,
                    measure = it.measure
                )
            }
        }catch (e: Exception){
            e.printStackTrace()
            throw FishingBookException("Error while getting rows for page $pageId. ${e.message}")
        }
    }

    suspend fun deletePage(pageId: String){
        try {
            fishingPagesCollection.deleteOne(FishingPageDocument::_id eq ObjectId(pageId))
            fishingRowsCollection.deleteMany(FishingBookRowDocument::pageId eq pageId)
        }catch (e: Exception) {
            e.printStackTrace()
            throw FishingBookException("Error while deleting page $pageId. ${e.message}")
        }
    }

    suspend fun deleteRow(rowId: String){
        try {
            fishingRowsCollection.deleteOne(FishingBookRowDocument::_id eq ObjectId(rowId))
        }catch (e: Exception) {
            e.printStackTrace()
            throw FishingBookException("Error while deleting row $rowId. ${e.message}")
        }
    }
}