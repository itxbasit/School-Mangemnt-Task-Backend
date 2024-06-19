import express from 'express'
import Create from './Create.js'
import Enrolled from './enrolled.js'
import SignIn from './signIn.js'
import Delete from './delete.js'
import Update from './update.js'
import Get from './get.js'


const router = express.Router()

router.use('/create', Create)
router.use('/enrolled', Enrolled)
router.use('/signIn', SignIn)
router.use('/delete', Delete)
router.use('/update', Update)
router.use('/get', Get)

export default router;